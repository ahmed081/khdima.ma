import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromAuth } from "@/lib/auth"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const providerId = Number(id)

    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      include: {
        user:     { select: { name: true, email: true, createdAt: true } },
        city:     { select: { name: true } },
        category: { select: { code: true, slug: true } },
        _count:   { select: { contactLogs: true, portfolioImages: true, reviews: true } },
      },
    })

    if (!provider) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // Contact log breakdown by type
    const contactBreakdown = await prisma.contactLog.groupBy({
      by: ['type'],
      where: { providerId },
      _count: { type: true },
    })

    // Last 30 days contact trend (daily)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentLogs = await prisma.contactLog.findMany({
      where: { providerId, createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, type: true },
      orderBy: { createdAt: 'asc' },
    })

    // Group by date
    const dailyMap: Record<string, number> = {}
    recentLogs.forEach(log => {
      const dateKey = log.createdAt.toISOString().slice(0, 10)
      dailyMap[dateKey] = (dailyMap[dateKey] ?? 0) + 1
    })
    const trendData = Object.entries(dailyMap).map(([date, count]) => ({ date, count }))

    // Reviews
    const reviews = await prisma.review.findMany({
      where: { providerId },
      select: { rating: true, comment: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    const breakdown: Record<string, number> = {}
    contactBreakdown.forEach(b => { breakdown[b.type] = b._count.type })

    return NextResponse.json({
      ...provider,
      contactBreakdown: breakdown,
      trendData,
      recentReviews: reviews,
    })
  } catch (error) {
    console.error("Admin provider detail GET error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
