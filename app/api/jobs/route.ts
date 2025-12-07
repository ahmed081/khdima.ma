import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const jobs = await prisma.job.findMany({
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
            },
        })

        return NextResponse.json(jobs)
    } catch (error) {
        console.error("❌ Error fetching jobs:", error)
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
    }
}
