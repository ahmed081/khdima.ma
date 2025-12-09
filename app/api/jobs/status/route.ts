import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromAuth } from "@/lib/auth";

export async function PATCH(req: Request) {
    try {
        const user = await getUserFromAuth();
        if (!user || user.role !== "EMPLOYER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { jobId, status } = await req.json();

        if (!jobId || !status) {
            return NextResponse.json({ error: "Missing jobId or status" }, { status: 400 });
        }

        const allowedStatuses = ["PENDING_REVIEW", "ACTIVE", "DELETED"];
        if (!allowedStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        // Ensure job belongs to employer
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            select: { employerId: true },
        });

        if (!job || job.employerId !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updated = await prisma.job.update({
            where: { id: jobId },
            data: { status },
        });

        return NextResponse.json({ success: true, job: updated });
    } catch (e) {
        console.error("Failed to update job status:", e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
