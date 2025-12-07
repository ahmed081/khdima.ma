import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const types = await prisma.contractType.findMany({
            orderBy: { name: "asc" }
        })

        return NextResponse.json(types)
    } catch (err) {
        console.error("Error loading contract types:", err)
        return NextResponse.json({ error: "Failed to load contract types" }, { status: 500 })
    }
}
