import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

interface JobRequest {
    title: string
    companyName: string
    countryId: string
    cityId: string
    contractTypeId: string
    categoryId: string
    experienceLevelId: string
    salaryMin?: string
    salaryMax?: string
    description: string
    requirements: string
    benefits?: string
    competencies?: string
    skills: number[]
}

export async function POST(req: Request) {
    try {
        const body: JobRequest = await req.json()

        const {
            title,
            companyName,
            countryId,
            cityId,
            contractTypeId,
            categoryId,
            experienceLevelId,
            salaryMin,
            salaryMax,
            description,
            requirements,
            benefits,
            competencies,
            skills,
        } = body

        // ---------- VALIDATION ----------
        if (!title || !description || !requirements) {
            return NextResponse.json(
                { error: "Champs requis manquants." },
                { status: 400 }
            )
        }

        // ---------- AUTH (JWT FROM COOKIE) ----------
        const cookieHeader = req.headers.get("cookie") ?? ""
        const token = cookieHeader
            .split("; ")
            .find(c => c.startsWith("token="))
            ?.split("=")[1]

        if (!token) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: number
            role: string
        }

        if (decoded.role !== "EMPLOYER") {
            return NextResponse.json(
                { error: "Accès réservé aux employeurs." },
                { status: 403 }
            )
        }

        // ---------- CREATE JOB ----------
        const job = await prisma.job.create({
            data: {
                title,
                description,
                employerId: decoded.id,

                cityId: Number(cityId),
                countryId: Number(countryId),

                contractTypeId: Number(contractTypeId),
                categoryId: Number(categoryId),
                experienceLevelId: Number(experienceLevelId),

                salary:
                    salaryMin && salaryMax
                        ? `${salaryMin} - ${salaryMax} MAD`
                        : null,

                // Convert multi-line text → string[]
                requirements: requirements
                    .split("\n")
                    .map(s => s.trim())
                    .filter(Boolean),

                benefits: benefits
                    ? benefits.split("\n").map(s => s.trim()).filter(Boolean)
                    : [],

                competencies: competencies
                    ? competencies.split("\n").map(s => s.trim()).filter(Boolean)
                    : [],

                // Create many-to-many JobSkills relation
                skills: {
                    create: skills.map(id => ({ skillId: id })),
                },
            },
        })

        return NextResponse.json({ message: "Offre créée", job })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
    }
}
