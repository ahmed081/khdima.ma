import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const { search, city, contract, salaryRange } = await req.json();

    const where: any = {};

    // 🔍 Text search in title, description, skills
    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            {
                skills: {
                    some: {
                        skill: {
                            name: { contains: search, mode: "insensitive" },
                        },
                    },
                },
            },
        ];
    }

    // 📍 City filter
    if (city) {
        where.city = { name: city };
    }

    // 🧾 Contract type filter
    if (contract) {
        where.contractType = { name: contract };
    }

    // 💰 Salary range (ex: "5000-10000")
    if (salaryRange) {
        const [min, max] = salaryRange.split("-").map(Number);
        where.salary = {
            gte: min,
            lte: max,
        };
    }

    const jobs = await prisma.job.findMany({
        where,
        include: {
            employer: true,
            city: true,
            country: true,
            contractType: true,
            skills: {
                include: { skill: true },
            },
            _count: { select: { applications: true } },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return NextResponse.json(jobs);
}
