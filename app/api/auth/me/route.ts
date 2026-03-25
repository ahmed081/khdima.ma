import { NextRequest, NextResponse } from "next/server"
import { getUserFromAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  const user = await getUserFromAuth()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    cityId: user.cityId,
    createdAt: user.createdAt,
  }

  return NextResponse.json(safeUser)
}

export async function PATCH(req: NextRequest) {
  const user = await getUserFromAuth()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name, password } = await req.json()
    const updateData: any = {}
    if (name) updateData.name = name
    if (password) updateData.password = await bcrypt.hash(password, 10)

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    })

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
      cityId: updated.cityId,
      createdAt: updated.createdAt,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Update failed" }, { status: 500 })
  }
}
