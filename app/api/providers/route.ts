import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const categorySlug = searchParams.get('categorySlug')
    const cityId = searchParams.get('cityId')
    const minRating = searchParams.get('minRating')
    const availability = searchParams.get('availability')
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '12')
    const skip = (page - 1) * limit

    const where: any = { status: 'ACTIVE' }

    if (categorySlug) {
      const cat = await prisma.serviceCategory.findUnique({ where: { slug: categorySlug } })
      if (cat) where.categoryId = cat.id
    }
    if (cityId) where.cityId = parseInt(cityId)
    if (availability) where.availability = availability
    if (minRating) where.rating = { gte: parseFloat(minRating) }

    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
        where,
        skip,
        take: limit,
        orderBy: { rating: 'desc' },
        include: {
          user: { select: { name: true } },
          city: true,
          category: true,
          _count: { select: { reviews: true } }
        }
      }),
      prisma.provider.count({ where })
    ])

    return NextResponse.json({ providers, total })
  } catch (error) {
    console.error("Providers error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
