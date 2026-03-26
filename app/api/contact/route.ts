import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, subject, message } = body

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Name, email and message are required" }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    // Store in Param table as a serialized JSON (simple approach without schema migration)
    // We create a key like CONTACT_SUBMISSION_{timestamp}
    const key   = `CONTACT_SUBMISSION_${Date.now()}`
    const value = JSON.stringify({ name, email, phone, subject, message, createdAt: new Date().toISOString() })

    await prisma.param.create({
      data: {
        key,
        value,
        description: `Contact form submission from ${name} <${email}>`,
        isPublic: false,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("[CONTACT]", err)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

// GET — returns contact info params (phone, email, address, social)
export async function GET() {
  try {
    const keys = ["CONTACT_PHONE", "CONTACT_EMAIL", "CONTACT_ADDRESS", "CONTACT_WHATSAPP",
                  "CONTACT_FACEBOOK", "CONTACT_INSTAGRAM", "CONTACT_LINKEDIN", "CONTACT_HOURS"]
    const params = await prisma.param.findMany({
      where: { key: { in: keys }, isPublic: true },
    })
    const info: Record<string, string> = {}
    for (const p of params) info[p.key] = p.value
    return NextResponse.json(info)
  } catch (err) {
    return NextResponse.json({})
  }
}
