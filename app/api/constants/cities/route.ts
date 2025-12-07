import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    try {
        const countryId = req.nextUrl.searchParams.get("countryId")
        if (!countryId) {
            return NextResponse.json({ error: "countryId is required" }, { status: 400 })
        }

        const cities = await prisma.city.findMany({
            where: { countryId: Number(countryId) },
            orderBy: { name: "asc" },
        })

        return NextResponse.json(cities)
    } catch (err) {
        console.error("Error loading cities:", err)
        return NextResponse.json({ error: "Failed to load cities" }, { status: 500 })
    }
}
