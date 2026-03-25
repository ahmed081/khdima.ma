import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromAuth } from "@/lib/auth"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const providerId = parseInt(id)
    const user = await getUserFromAuth()

    const { reason, details } = await req.json()
    if (!reason?.trim()) {
      return NextResponse.json({ error: "Reason required" }, { status: 400 })
    }

    const report = await prisma.report.create({
      data: {
        providerId,
        reporterId: user?.id ?? null,
        reason: reason.trim(),
        details: details?.trim() ?? null,
      },
    })

    return NextResponse.json({ success: true, id: report.id })
  } catch (error) {
    console.error("Report error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
