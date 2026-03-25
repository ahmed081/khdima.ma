import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromAuth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const status = req.nextUrl.searchParams.get('status') as any

    const reports = await prisma.report.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        provider:  { select: { id: true, businessName: true } },
        reporter:  { select: { name: true, email: true } },
      },
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error("Admin reports GET error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, status, adminNote } = await req.json()
    if (!id || !['OPEN', 'REVIEWED', 'DISMISSED'].includes(status)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    const updated = await prisma.report.update({
      where: { id: Number(id) },
      data: { status, adminNote: adminNote ?? undefined },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Admin reports PATCH error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
