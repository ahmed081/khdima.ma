import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromAuth } from "@/lib/auth"

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== 'PROVIDER') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { bio, phone, whatsapp, availability, yearsExperience, avatarUrl } = await req.json()

    const provider = await prisma.provider.findUnique({ where: { userId: user.id } })
    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    const updateData: any = {}
    if (bio !== undefined) updateData.bio = bio
    if (phone !== undefined) updateData.phone = phone
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp
    if (availability !== undefined) updateData.availability = availability
    if (yearsExperience !== undefined) updateData.yearsExperience = yearsExperience
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl

    const updated = await prisma.provider.update({
      where: { id: provider.id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Provider profile update error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
