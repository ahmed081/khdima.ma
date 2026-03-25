import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

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
        portfolioImages: { orderBy: { order: 'asc' } }
      }
    })

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    // Increment profile views atomically
    await prisma.provider.update({
      where: { id: provider.id },
      data: { profileViews: { increment: 1 } }
    })

    return NextResponse.json(provider)
  } catch (error) {
    console.error("Provider detail error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
