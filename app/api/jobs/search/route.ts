import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const { search, city, jobType, salaryRange } = await req.json()

        const salaryFilter: any = {}

        if (salaryRange) {
            const [min, max] = salaryRange.split("-")

            if (min) salaryFilter.gte = Number(min)
            if (max && max !== "+") salaryFilter.lte = Number(max)
        }

        const jobs = await prisma.job.findMany({
            where: {
                title: search ? { contains: search, mode: "insensitive" } : undefined,
                location: city ? { equals: city, mode: "insensitive" } : undefined,
                type: jobType ? jobType.toUpperCase() : undefined,
            },
            include: {
                employer: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return NextResponse.json(jobs)
    } catch (error) {
        console.error("Search error:", error)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}
