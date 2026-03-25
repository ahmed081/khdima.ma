import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { providers: true, subcategories: true } }
      }
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Categories error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
