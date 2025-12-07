import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const jobs = await prisma.job.findMany({
            take: 6, // latest 6 featured jobs
            orderBy: { createdAt: "desc" },
            include: {
                employer: {
                    select: {
                        id: true,
                        name: true,
                        companyName: true,
                        companyLogoUrl: true,
                    },
                },
                city: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                country: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                contractType: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                experienceLevel: {
                    select: {
                        id: true,
                        name: true,
                    },
                },

                // Many-to-many skills → return actual skill names
                skills: {
                    include: {
                        skill: true,
                    },
                },
            },
        })

        return NextResponse.json(jobs)
    } catch (err) {
        console.error("❌ Featured jobs API error:", err)
        return NextResponse.json({ error: err }, { status: 500 })
    }
}
