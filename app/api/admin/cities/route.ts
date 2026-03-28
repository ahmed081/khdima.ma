import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromAuth } from "@/lib/auth"

async function requireAdmin() {
  const user = await getUserFromAuth()
  if (!user || user.role !== "ADMIN") return null
  return user
}

export async function GET() {
  try {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const cities = await prisma.city.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: {
        _count: { select: { users: true, providers: true } },
      },
    })

    return NextResponse.json(cities)
  } catch (error) {
    console.error("[admin/cities GET]", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { code, name, nameAr, nameFr, order } = await req.json()

    if (!code || !name || !nameAr || !nameFr) {
      return NextResponse.json({ error: "code, name, nameAr, nameFr are required" }, { status: 400 })
    }

    const morocco = await prisma.country.findFirst({ where: { code: "MA" } })
    if (!morocco) return NextResponse.json({ error: "Country MA not found" }, { status: 500 })

    const city = await prisma.city.create({
      data: {
        code:      code.toUpperCase(),
        name,
        nameAr,
        nameFr,
        countryId: morocco.id,
        isActive:  true,
        order:     order ? Number(order) : 99,
      },
      include: { _count: { select: { users: true, providers: true } } },
    })

    return NextResponse.json(city, { status: 201 })
  } catch (error: any) {
    console.error("[admin/cities POST]", error)
    if (error.code === "P2002") {
      return NextResponse.json({ error: "City code or name already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
