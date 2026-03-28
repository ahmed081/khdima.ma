import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const locale = req.nextUrl.searchParams.get('locale') ?? 'fr'
    const cities = await prisma.city.findMany({ where: { isActive: true }, orderBy: [{ order: 'asc' }, { name: 'asc' }] })

    const result = cities.map(c => ({
      id: c.id,
      code: c.code,
      name: locale === 'ar' ? c.nameAr : locale === 'fr' ? c.nameFr : c.name,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Cities error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
