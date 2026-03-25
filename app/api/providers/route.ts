import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { tMany } from "@/lib/translations"
import type { Locale } from "@/lib/translations"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const categorySlug = searchParams.get('categorySlug')
    const cityId        = searchParams.get('cityId')
    const minRating     = searchParams.get('minRating')
    const availability  = searchParams.get('availability')
    const q             = searchParams.get('q')?.trim()
    const locale        = (searchParams.get('locale') ?? 'fr') as Locale
    const page          = parseInt(searchParams.get('page') ?? '1')
    const limit         = Math.min(parseInt(searchParams.get('limit') ?? '12'), 50)
    const skip          = (page - 1) * limit

    const where: any = { status: 'ACTIVE' }

    if (categorySlug) {
      const cat = await prisma.serviceCategory.findUnique({ where: { slug: categorySlug } })
      if (cat) where.categoryId = cat.id
    }
    if (cityId)      where.cityId       = parseInt(cityId)
    if (availability) where.availability = availability
    if (minRating)   where.rating       = { gte: parseFloat(minRating) }
    if (q) {
      where.OR = [
        { businessName: { contains: q, mode: 'insensitive' } },
        { bio:          { contains: q, mode: 'insensitive' } },
        { bioFr:        { contains: q, mode: 'insensitive' } },
        { bioAr:        { contains: q, mode: 'insensitive' } },
        { city: { name:   { contains: q, mode: 'insensitive' } } },
        { city: { nameFr: { contains: q, mode: 'insensitive' } } },
        { city: { nameAr: { contains: q, mode: 'insensitive' } } },
      ]
    }

    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
        include: {
          city:     true,
          category: true,
        }
      }),
      prisma.provider.count({ where })
    ])

    // Batch-translate category names
    const catCodes   = [...new Set(providers.map(p => `CAT_${p.category.code}`))]
    const translations = catCodes.length ? await tMany(catCodes, locale) : {}

    const result = providers.map(p => ({
      id:              p.id,
      businessName:    p.businessName,
      avatarUrl:       p.avatarUrl,
      rating:          p.rating,
      reviewCount:     p.reviewCount,
      yearsExperience: p.yearsExperience,
      isVerified:      p.isVerified,
      availability:    p.availability,
      phone:           p.phone,
      whatsapp:        p.whatsapp,
      city: {
        id:   p.city.id,
        code: p.city.code,
        name: locale === 'ar' ? p.city.nameAr : locale === 'fr' ? p.city.nameFr : p.city.name,
      },
      category: {
        id:   p.category.id,
        code: p.category.code,
        slug: p.category.slug,
        icon: p.category.icon,
        name: translations[`CAT_${p.category.code}`] ?? p.category.code,
      },
    }))

    return NextResponse.json({ providers: result, total, page, limit })
  } catch (error) {
    console.error("Providers error:", error)
    // Return a valid shape so callers never crash on .map
    return NextResponse.json({ providers: [], total: 0, page: 1, limit: 12 }, { status: 200 })
  }
}
