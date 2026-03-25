import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromAuth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromAuth()
    if (!user) {
      return NextResponse.json({ error: "Login required" }, { status: 401 })
    }

    const { providerId, rating, comment } = await req.json()

    if (!providerId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid review data" }, { status: 400 })
    }

    // Upsert review (one per user per provider)
    await prisma.review.upsert({
      where: { providerId_userId: { providerId: Number(providerId), userId: user.id } },
      update: { rating: Number(rating), comment: comment ?? null },
      create: {
        providerId: Number(providerId),
        userId: user.id,
        rating: Number(rating),
        comment: comment ?? null,
      }
    })

    // Recalculate provider rating and reviewCount
    const reviews = await prisma.review.findMany({
      where: { providerId: Number(providerId), isVisible: true },
      select: { rating: true }
    })

    const reviewCount = reviews.length
    const avgRating = reviewCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0

    await prisma.provider.update({
      where: { id: Number(providerId) },
      data: { rating: avgRating, reviewCount }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Review error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
