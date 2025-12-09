import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromAuth } from "@/lib/auth";
import {JobStatus} from "@/generated/prisma/enums";
import {formatRelativeDate} from "@/lib/date";



// 🔵 Mapping function for job status
function mapJobStatus(status: JobStatus) {
    switch (status) {
        case "PENDING_REVIEW":
            return "En attente";
        case "ACTIVE":
            return "validé";
        default:
            return "inconnu";
    }
}

export async function GET() {
    const user = await getUserFromAuth();
    if (!user || user.role !== "EMPLOYER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔥 Get ONLY active + pending jobs
    const jobs = await prisma.job.findMany({
        where: {
            employerId: user.id,
            // status: { in: ["PENDING_REVIEW", "ACTIVE"] },
        },
        include: {
            _count: { select: { applications: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    const applications = await prisma.application.findMany({
        where: { job: { employerId: user.id } },
        include: {
            job: { select: { title: true } },
            user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
    });

    const activeOffers = jobs.filter((j) => j.status === "ACTIVE").length;
    const pendingOffers = jobs.filter((j) => j.status === "PENDING_REVIEW").length;
    const deletedOffers = jobs.filter((j) => j.status === "DELETED").length;
    const totalApplications = applications.length;
    const totalViews = jobs.reduce((sum, j) => sum + (j.views ?? 0), 0);

    return NextResponse.json({
        stats: {
            activeOffers,
            totalApplications,
            totalViews,
            pendingOffers,
            deletedOffers
        },
        offers: jobs.filter((j) => j.status !== "DELETED").map((job) => ({
            id: job.id,
            title: job.title,
            status: job.status, // 👈 mapped value
            statusLibele: mapJobStatus(job.status), // 👈 mapped value
            applicants: job._count.applications,
            views: job.views ?? 0,
            postedAt: formatRelativeDate(job.createdAt),
        })),
        applicants: applications.map((a) => ({
            id: a.user.id,
            name: a.user.name ?? "Candidat",
            position: a.job.title,
            appliedAt: formatRelativeDate(a.createdAt),
            status: a.status ?? "new",
        })),
    });
}
