import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromAuth } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== "PROVIDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const provider = await prisma.provider.findUnique({
      where: { userId: user.id },
      include: {
        city: true,
        category: true,
        subcategories: { include: { subcategory: true } },
      },
    })

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    return NextResponse.json(provider)
  } catch (error) {
    console.error("Provider profile GET error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== "PROVIDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      businessName,
      bio,
      bioFr,
      bioAr,
      phone,
      whatsapp,
      website,
      avatarUrl,
      cityId,
      categoryId,
      yearsExperience,
      availability,
      workingHours,
      subcategoryIds,
    } = body

    const provider = await prisma.provider.findUnique({ where: { userId: user.id } })
    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    // Validate required fields
    if (phone !== undefined && !phone.trim()) {
      return NextResponse.json({ error: "Le téléphone est requis." }, { status: 400 })
    }
    if (businessName !== undefined && !businessName.trim()) {
      return NextResponse.json({ error: "Le nom de l'entreprise est requis." }, { status: 400 })
    }

    const updateData: any = {}
    if (businessName   !== undefined) updateData.businessName   = businessName.trim()
    if (bio            !== undefined) updateData.bio            = bio || null
    if (bioFr          !== undefined) updateData.bioFr          = bioFr || null
    if (bioAr          !== undefined) updateData.bioAr          = bioAr || null
    if (phone          !== undefined) updateData.phone          = phone.trim()
    if (whatsapp       !== undefined) updateData.whatsapp       = whatsapp || null
    if (website        !== undefined) updateData.website        = website || null
    if (avatarUrl      !== undefined) updateData.avatarUrl      = avatarUrl || null
    if (cityId         !== undefined) updateData.cityId         = Number(cityId)
    if (categoryId     !== undefined) updateData.categoryId     = Number(categoryId)
    if (yearsExperience !== undefined) updateData.yearsExperience = yearsExperience ? Number(yearsExperience) : null
    if (availability   !== undefined) updateData.availability   = availability
    if (workingHours   !== undefined) updateData.workingHours   = workingHours

    // Run everything in a transaction
    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.provider.update({
        where: { id: provider.id },
        data: updateData,
      })

      // Sync subcategories if provided
      if (Array.isArray(subcategoryIds)) {
        await tx.providerSubcategory.deleteMany({ where: { providerId: provider.id } })
        if (subcategoryIds.length > 0) {
          await tx.providerSubcategory.createMany({
            data: subcategoryIds.map((sid: number) => ({
              providerId: provider.id,
              subcategoryId: Number(sid),
            })),
          })
        }
      }

      return p
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error("Provider profile update error:", error)
    return NextResponse.json({ error: error.message ?? "Server error" }, { status: 500 })
  }
}
