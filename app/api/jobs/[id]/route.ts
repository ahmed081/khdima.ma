import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/jobs/[id]
export async function GET(
    req: Request,
    context: { params: { id: string } }
) {
    try {
        const jobId = Number(context.params.id);

        if (isNaN(jobId)) {
            return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
        }

        const job = await prisma.job.findUnique({
            where: { id: jobId },
            include: {
                employer: true,
                skills: {
                    include: { skill: true }, // if using JobSkill relation
                },
            },
        });

        if (!job) {
            return NextResponse.json(
                { error: "Job not found" },
                { status: 404 }
            );
        }

        // If skills is JobSkill[] → flatten to skill object
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
