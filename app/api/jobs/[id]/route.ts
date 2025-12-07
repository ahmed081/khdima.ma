import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface Params {
    params: { id: string }
}

export async function GET(req: Request, { params }: Params) {
    try {
        const jobId = Number(params.id)

        if (isNaN(jobId)) {
            return NextResponse.json({ error: "Invalid job ID" }, { status: 400 })
        }

        const job = await prisma.job.findUnique({
            where: { id: jobId },
            include: {
                employer: {
                    select: {
                        id: true,
                        name: true,
                        companyName: true,
                        companyLogoUrl: true,
                    },
                },
                city: true,
                country: true,
                contractType: true,
                category: true,
                experienceLevel: true,
                skills: {
                    include: {
                        skill: true,
                    },
                },
                applications: {
                    select: {
                        id: true,
                        createdAt: true,
                        status: true,
                        userId: true,
                    },
                },
            },
        })

        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 })
        }

        return NextResponse.json(job)
    } catch (error) {
        console.error("❌ Error fetching job:", error)
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
    }
}
