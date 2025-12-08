import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromAuth } from "@/lib/auth";

function formatRelativeDate(date: Date): string {
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Il y a 1 jour";
    if (days < 7) return `Il y a ${days} jours`;
    const weeks = Math.floor(days / 7);
    return `Il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`;
}

export async function GET() {
    const user = await getUserFromAuth();
    if (!user || user.role !== "EMPLOYER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobs = await prisma.job.findMany({
        where: { employerId: user.id },
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
    const totalApplications = applications.length;
    const totalViews = jobs.reduce((sum, j) => sum + (j.views ?? 0), 0);

    return NextResponse.json({
        stats: {
            activeOffers,
            totalApplications,
            totalViews,
        },
        offers: jobs.map((job) => ({
            id: job.id,
            title: job.title,
            status: job.status === "ACTIVE" ? "active" : "closed",
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
