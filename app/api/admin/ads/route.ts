import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromAuth } from "@/lib/auth"

export const AD_KEYS = [
  "AD_LEFT_ENABLED", "AD_LEFT_SIZE", "AD_LEFT_IMAGE_URL", "AD_LEFT_LINK_URL", "AD_LEFT_ALT",
  "AD_RIGHT_ENABLED", "AD_RIGHT_SIZE", "AD_RIGHT_IMAGE_URL", "AD_RIGHT_LINK_URL", "AD_RIGHT_ALT",
]

async function requireAdmin() {
  const user = await getUserFromAuth()
  if (!user || user.role !== "ADMIN") return null
  return user
}

export async function GET() {
  try {
    const params = await prisma.param.findMany({ where: { key: { in: AD_KEYS } } })
    const result: Record<string, string> = {}
    for (const p of params) result[p.key] = p.value
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({})
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const body: Record<string, string> = await req.json()

  await Promise.all(
    AD_KEYS.map(async key => {
      const value = (body[key] ?? "").trim()
      await prisma.param.upsert({
        where:  { key },
        update: { value, isPublic: true },
        create: { key, value, isPublic: true, description: `Ad slot setting: ${key}` },
      })
    })
  )

  return NextResponse.json({ success: true })
}
