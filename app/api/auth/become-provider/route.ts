import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromAuth } from "@/lib/auth"
import jwt from "jsonwebtoken"

// Authenticated client upgrades their account to provider
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getUserFromAuth()
    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    if (currentUser.role === "PROVIDER") {
      return NextResponse.json({ error: "Already a provider" }, { status: 400 })
    }

    const {
      businessName, phone, whatsapp,
      cityId, categoryId, yearsExperience, bio,
    } = await req.json()

    if (!businessName || !phone || !cityId || !categoryId) {
      return NextResponse.json({ error: "Please fill all required fields" }, { status: 400 })
    }

    const existing = await prisma.provider.findUnique({ where: { userId: currentUser.id } })
    if (existing) {
      return NextResponse.json({ error: "Provider profile already exists" }, { status: 400 })
    }

    const result = await prisma.$transaction(async tx => {
      const provider = await tx.provider.create({
        data: {
          userId:          currentUser.id,
          businessName,
          phone,
          whatsapp:        whatsapp || null,
          cityId:          Number(cityId),
          categoryId:      Number(categoryId),
          yearsExperience: yearsExperience ? Number(yearsExperience) : null,
          bio:             bio || null,
          status:          "PENDING",
        },
      })

      const user = await tx.user.update({
        where: { id: currentUser.id },
        data:  { role: "PROVIDER" },
      })

      return { user, provider }
    })

    // Re-issue JWT with new role
    const token = jwt.sign(
      { id: result.user.id, email: result.user.email, role: result.user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    )

    const response = NextResponse.json({
      message: "Provider profile created",
      provider: result.provider,
      user: { id: result.user.id, name: result.user.name, email: result.user.email, role: result.user.role, phone: result.user.phone },
    })
    response.cookies.set("token", token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      path:     "/",
      maxAge:   60 * 60 * 24 * 7,
    })
    return response
  } catch (error: any) {
    console.error("[become-provider]", error)
    return NextResponse.json({ error: error.message ?? "Server error" }, { status: 500 })
  }
}
