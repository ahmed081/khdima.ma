import { prisma } from "@/lib/prisma";
import { getUserFromAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const user = await getUserFromAuth();
    if (!user || user.role !== "EMPLOYER")
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const jobId = Number(params.id);

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    if (job.employerId !== user.id)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.job.delete({ where: { id: jobId } });

    return NextResponse.json({ success: true });
}
