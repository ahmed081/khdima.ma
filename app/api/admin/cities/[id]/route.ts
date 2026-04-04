import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromAuth } from "@/lib/auth"

async function requireAdmin() {
  const user = await getUserFromAuth()
  if (!user || user.role !== "ADMIN") return null
  return user
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id: rawId } = await params
    const id = Number(rawId)
    const body = await req.json()

    const data: Record<string, any> = {}
    if (body.name     !== undefined) data.name     = body.name
    if (body.nameAr   !== undefined) data.nameAr   = body.nameAr
    if (body.nameFr   !== undefined) data.nameFr   = body.nameFr
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive)
    if (body.order    !== undefined) data.order    = Number(body.order)

    const city = await prisma.city.update({
      where: { id },
      data,
      include: { _count: { select: { users: true, providers: true } } },
    })

    return NextResponse.json(city)
  } catch (error: any) {
    console.error("[admin/cities PATCH]", error)
    if (error.code === "P2025") return NextResponse.json({ error: "City not found" }, { status: 404 })
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
