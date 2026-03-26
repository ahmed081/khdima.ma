import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromAuth } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== "PROVIDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const provider = await prisma.provider.findUnique({
      where: { userId: user.id },
      include: {
        city: true,
        category: true,
        subcategories: {
          include: { subcategory: true },
        },
      },
    })

    if (!provider) {
      return NextResponse.json({ error: "Provider profile not found" }, { status: 404 })
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [whatsappCount, callCount, recentReviews, last7DaysLogs] = await Promise.all([
      prisma.contactLog.count({
        where: {
          providerId: provider.id,
          type: "WHATSAPP",
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.contactLog.count({
        where: {
          providerId: provider.id,
          type: "CALL",
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.review.findMany({
        where: { providerId: provider.id, isVisible: true },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { user: { select: { name: true } } },
      }),
      prisma.contactLog.findMany({
        where: {
          providerId: provider.id,
          type: { in: ["WHATSAPP", "CALL"] },
          createdAt: { gte: sevenDaysAgo },
        },
        select: { type: true, createdAt: true },
      }),
    ])

    // Build daily contact breakdown for the last 7 days
    const dailyMap: Record<string, { date: string; whatsapp: number; call: number }> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split("T")[0]
      // Format as "Mon 23" style for chart labels
      const label = d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })
      dailyMap[key] = { date: label, whatsapp: 0, call: 0 }
    }
    for (const log of last7DaysLogs) {
      const key = new Date(log.createdAt).toISOString().split("T")[0]
      if (dailyMap[key]) {
        if (log.type === "WHATSAPP") dailyMap[key].whatsapp++
        else if (log.type === "CALL") dailyMap[key].call++
      }
    }
    const dailyContacts = Object.values(dailyMap)

    return NextResponse.json({
      provider,
      stats: {
        profileViews: provider.profileViews,
        reviewCount: provider.reviewCount,
        rating: provider.rating,
      },
      contactStats: {
        whatsapp: whatsappCount,
        call: callCount,
      },
      dailyContacts,
      recentReviews,
    })
  } catch (error) {
    console.error("Provider dashboard error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
