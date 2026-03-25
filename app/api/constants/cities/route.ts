import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Used by hooks/useCities.ts — /api/constants/cities?countryId=1&locale=fr
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const countryId = searchParams.get('countryId')
    const locale    = searchParams.get('locale') ?? 'fr'

    const cities = await prisma.city.findMany({
      where: countryId ? { countryId: parseInt(countryId) } : undefined,
      orderBy: { name: 'asc' },
    })

    const result = cities.map(c => ({
      id:   c.id,
      code: c.code,
      name: locale === 'ar' ? c.nameAr : locale === 'fr' ? c.nameFr : c.name,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Constants/cities error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
