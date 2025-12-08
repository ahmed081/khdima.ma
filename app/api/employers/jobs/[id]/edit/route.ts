import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromAuth } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const employer = await getUserFromAuth();
    if (!employer || employer.role !== "EMPLOYER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobId = Number(params.id);
    const data = await req.json();

    const existing = await prisma.job.findUnique({
        where: { id: jobId },
    });

    if (!existing || existing.employerId !== employer.id) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const updated = await prisma.job.update({
        where: { id: jobId },
        data: {
            title: data.title,
            description: data.description,
            salary: data.salary,
            cityId: data.cityId,
            contractTypeId: data.contractTypeId,
            status: data.status,
        },
    });

    return NextResponse.json({ success: true, job: updated });
}
