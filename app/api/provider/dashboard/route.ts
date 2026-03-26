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

    const [whatsappCount, callCount, recentReviews] = await Promise.all([
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
    ])

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
      recentReviews,
    })
  } catch (error) {
    console.error("Provider dashboard error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
