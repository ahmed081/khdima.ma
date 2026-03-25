import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromAuth } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo  = new Date(now.getTime() -  7 * 24 * 60 * 60 * 1000)

    const [
      totalProviders,
      activeProviders,
      pendingProviders,
      suspendedProviders,
      totalUsers,
      totalReviews,
      totalContacts,
      recentContacts,
      contactsByType,
      providersByCategory,
      providersByCity,
      topProviders,
      dailyContacts,
    ] = await Promise.all([
      prisma.provider.count(),
      prisma.provider.count({ where: { status: 'ACTIVE' } }),
      prisma.provider.count({ where: { status: 'PENDING' } }),
      prisma.provider.count({ where: { status: 'SUSPENDED' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.review.count(),
      prisma.contactLog.count(),
      prisma.contactLog.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),

      // Contacts by type (last 30 days)
      prisma.contactLog.groupBy({
        by: ['type'],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: { id: true },
      }),

      // Providers by category (top 10)
      prisma.provider.groupBy({
        by: ['categoryId'],
        where: { status: 'ACTIVE' },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),

      // Providers by city (top 10)
      prisma.provider.groupBy({
        by: ['cityId'],
        where: { status: 'ACTIVE' },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),

      // Top 5 providers by rating
      prisma.provider.findMany({
        where: { status: 'ACTIVE', reviewCount: { gt: 0 } },
        orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
        take: 5,
        select: {
          id:           true,
          businessName: true,
          rating:       true,
          reviewCount:  true,
          profileViews: true,
          category:     { select: { code: true, slug: true } },
          city:         { select: { code: true, nameFr: true } },
        }
      }),

      // Daily contacts last 7 days (raw count by day)
      prisma.$queryRaw<{ date: string; count: bigint }[]>`
        SELECT DATE("createdAt")::text as date, COUNT(*) as count
        FROM "ContactLog"
        WHERE "createdAt" >= ${sevenDaysAgo}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
    ])

    // Enrich categories
    const categoryIds = [...new Set(providersByCategory.map(r => r.categoryId))]
    const catRecords  = await prisma.serviceCategory.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, code: true, slug: true, icon: true },
    })
    const catMap = Object.fromEntries(catRecords.map(c => [c.id, c]))

    // Enrich cities
    const cityIds   = [...new Set(providersByCity.map(r => r.cityId))]
    const cityRecs  = await prisma.city.findMany({
      where: { id: { in: cityIds } },
      select: { id: true, code: true, nameFr: true },
    })
    const cityMap = Object.fromEntries(cityRecs.map(c => [c.id, c]))

    return NextResponse.json({
      overview: {
        totalProviders,
        activeProviders,
        pendingProviders,
        suspendedProviders,
        totalUsers,
        totalReviews,
        totalContacts,
        recentContacts,
      },
      contactsByType: contactsByType.map(r => ({ type: r.type, count: r._count.id })),
      providersByCategory: providersByCategory.map(r => ({
        category: catMap[r.categoryId] ?? { code: String(r.categoryId) },
        count: r._count.id,
      })),
      providersByCity: providersByCity.map(r => ({
        city: cityMap[r.cityId] ?? { code: String(r.cityId) },
        count: r._count.id,
      })),
      topProviders,
      dailyContacts: dailyContacts.map(r => ({
        date:  r.date,
        count: Number(r.count),
      })),
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
