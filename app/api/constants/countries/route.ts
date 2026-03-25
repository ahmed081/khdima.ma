import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Used by hooks/useCountries.ts — /api/constants/countries?locale=fr
export async function GET(req: NextRequest) {
  try {
    const locale = req.nextUrl.searchParams.get('locale') ?? 'fr'
    const countries = await prisma.country.findMany({ orderBy: { name: 'asc' } })

    const result = countries.map(c => ({
      id:   c.id,
      code: c.code,
      name: locale === 'ar' ? c.nameAr : locale === 'fr' ? c.nameFr : c.name,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Constants/countries error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
