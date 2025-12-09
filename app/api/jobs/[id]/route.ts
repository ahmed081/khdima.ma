import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params; // MUST await
        const jobId = Number(id);

        if (isNaN(jobId)) {
            return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
        }

        const job = await prisma.job.findUnique({
            where: { id: jobId },
            include: {
                employer: true,
                skills: {
                    include: { skill: true },
                },
            },
        });

        if (!job) {
            return NextResponse.json(
                { error: "Job not found" },
                { status: 404 }
            );
        }

        const formattedJob = {
            ...job,
            skills: job.skills.map((js) => ({
                id: js.skill.id,
                name: js.skill.name,
            })),
        };

        return NextResponse.json(formattedJob);
    } catch (err) {
        console.error("❌ GET /api/jobs/[id] error:", err);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}
