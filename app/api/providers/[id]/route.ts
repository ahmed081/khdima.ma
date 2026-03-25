import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { tMany } from "@/lib/translations"
import type { Locale } from "@/lib/translations"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const locale = (req.nextUrl.searchParams.get('locale') ?? 'fr') as Locale

    const provider = await prisma.provider.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { name: true, email: true } },
        city: true,
        category: true,
        subcategories: { include: { subcategory: true } },
        reviews: {
          where: { isVisible: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { user: { select: { name: true } } }
        },
        portfolioImages: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] }
      }
    })

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    // Translate category + subcategories
    const catCode     = `CAT_${provider.category.code}`
    const subcatCodes = provider.subcategories.map(ps => `SUBCAT_${ps.subcategory.code}`)
    const translations = await tMany([catCode, ...subcatCodes], locale)

    // Increment profile views (fire and forget, don't await)
    prisma.provider.update({
      where: { id: provider.id },
      data: { profileViews: { increment: 1 } }
    }).catch(() => {})

    const result = {
      id:              provider.id,
      businessName:    provider.businessName,
      bio:             locale === 'ar' ? (provider.bioAr ?? provider.bio) : locale === 'fr' ? (provider.bioFr ?? provider.bio) : provider.bio,
      phone:           provider.phone,
      whatsapp:        provider.whatsapp,
      website:         provider.website,
      avatarUrl:       provider.avatarUrl,
      rating:          provider.rating,
      reviewCount:     provider.reviewCount,
      yearsExperience: provider.yearsExperience,
      isVerified:      provider.isVerified,
      availability:    provider.availability,
      profileViews:    provider.profileViews,
      status:          provider.status,
      city: {
        id:   provider.city.id,
        code: provider.city.code,
        name: locale === 'ar' ? provider.city.nameAr : locale === 'fr' ? provider.city.nameFr : provider.city.name,
      },
      category: {
        id:   provider.category.id,
        code: provider.category.code,
        slug: provider.category.slug,
        icon: provider.category.icon,
        name: translations[catCode] ?? provider.category.code,
      },
      subcategories: provider.subcategories.map(ps => ({
        code: ps.subcategory.code,
        slug: ps.subcategory.slug,
        name: translations[`SUBCAT_${ps.subcategory.code}`] ?? ps.subcategory.code,
      })),
      portfolioImages: provider.portfolioImages.map(img => ({
        id:       img.id,
        url:      img.url,
        caption:  img.caption,
        isBefore: img.isBefore,
        pairId:   img.pairId,
        order:    img.order,
      })),
      reviews: provider.reviews.map(r => ({
        id:        r.id,
        rating:    r.rating,
        comment:   r.comment,
        createdAt: r.createdAt,
        user:      { name: r.user.name },
      })),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Provider detail error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
