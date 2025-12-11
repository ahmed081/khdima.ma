import {prisma} from "@/lib/prisma"
import {NextRequest, NextResponse} from "next/server"

export async function GET(req: NextRequest, context: { params: Promise<{ countryId: string }> }) {
    const {countryId} = await context.params; // MUST await
    const cities = await prisma.city.findMany({
        where: {countryId: Number(countryId)}, orderBy: {name: "asc"}
    })

    return NextResponse.json(cities)
}
