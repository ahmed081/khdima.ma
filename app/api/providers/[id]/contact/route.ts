import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromAuth } from "@/lib/auth"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { type } = await req.json()

    if (!['WHATSAPP', 'CALL', 'PROFILE_VIEW'].includes(type)) {
      return NextResponse.json({ error: "Invalid contact type" }, { status: 400 })
    }

    // Auth optional
    const user = await getUserFromAuth()
    const ipAddress = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? null

    await prisma.contactLog.create({
      data: {
        providerId: parseInt(id),
        userId: user?.id ?? null,
        type,
        ipAddress,
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Contact log error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
