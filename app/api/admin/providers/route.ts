import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromAuth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = req.nextUrl
    const status = searchParams.get('status')

    const providers = await prisma.provider.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        city: { select: { name: true } },
        category: { select: { code: true, slug: true } }
      }
    })

    return NextResponse.json(providers)
  } catch (error) {
    console.error("Admin providers GET error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, status, isVerified } = await req.json()

    if (!id) return NextResponse.json({ error: "Invalid data" }, { status: 400 })

    const updateData: any = {}
    if (status !== undefined) {
      if (!['ACTIVE', 'SUSPENDED', 'PENDING'].includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }
      updateData.status = status
    }
    if (isVerified !== undefined) updateData.isVerified = Boolean(isVerified)

    const updated = await prisma.provider.update({
      where: { id: Number(id) },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Admin providers PATCH error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
