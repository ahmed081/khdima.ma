import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const contexts = await prisma.skillContext.findMany({
            include: {
                skills: true,
            },
            orderBy: { name: "asc" },
        })

        return NextResponse.json(contexts)
    } catch (err) {
        console.error("Error loading skills:", err)
        return NextResponse.json({ error: "Failed to load skills" }, { status: 500 })
    }
}
