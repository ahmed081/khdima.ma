import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromAuth } from "@/lib/auth"

const CONTACT_KEYS = [
  "CONTACT_PHONE", "CONTACT_EMAIL", "CONTACT_WHATSAPP", "CONTACT_ADDRESS",
  "CONTACT_HOURS", "CONTACT_FACEBOOK", "CONTACT_INSTAGRAM", "CONTACT_LINKEDIN", "CONTACT_WEBSITE",
]

export async function GET() {
  try {
    const params = await prisma.param.findMany({ where: { key: { in: CONTACT_KEYS } } })
    const result: Record<string, string> = {}
    for (const p of params) result[p.key] = p.value
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({})
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromAuth()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const body: Record<string, string> = await req.json()

  // Upsert each key
  await Promise.all(
    CONTACT_KEYS.map(async key => {
      const value = (body[key] ?? "").trim()
      await prisma.param.upsert({
        where: { key },
        update: { value, isPublic: true },
        create: { key, value, isPublic: true, description: `Contact info: ${key}` },
      })
    })
  )

  return NextResponse.json({ success: true })
}
