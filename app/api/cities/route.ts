import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      orderBy: { name: 'asc' },
      include: { country: { select: { id: true, name: true } } }
    })
    return NextResponse.json(cities)
  } catch (error) {
    console.error("Cities error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
