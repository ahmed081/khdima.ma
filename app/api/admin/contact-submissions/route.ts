import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromAuth } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== "ADMIN") return NextResponse.json([], { status: 403 })

    const subs = await prisma.param.findMany({
      where: { key: { startsWith: "CONTACT_SUBMISSION_" } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(subs)
  } catch {
    return NextResponse.json([])
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getUserFromAuth()
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { key } = await req.json()
  if (!key?.startsWith("CONTACT_SUBMISSION_")) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 })
  }

  await prisma.param.deleteMany({ where: { key } })
  return NextResponse.json({ success: true })
}
