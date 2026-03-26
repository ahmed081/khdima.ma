import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(req: NextRequest) {
  try {
    const {
      name, email, password,
      businessName, phone, whatsapp,
      cityId, categoryId, yearsExperience, bio
    } = await req.json()

    if (!name || !email || !password || !businessName || !phone || !cityId || !categoryId) {
      return NextResponse.json({ error: "Veuillez remplir tous les champs obligatoires." }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({ where: { email } })
      if (existing) throw new Error("Cet email est déjà utilisé.")

      const hashedPassword = await bcrypt.hash(password, 10)

      const user = await tx.user.create({
        data: {
          name,
          email,
          role: 'PROVIDER',
          password: hashedPassword,
        },
      })

      const provider = await tx.provider.create({
        data: {
          userId: user.id,
          businessName,
          phone,
          whatsapp: whatsapp ?? null,
          cityId: Number(cityId),
          categoryId: Number(categoryId),
          yearsExperience: yearsExperience ? Number(yearsExperience) : null,
          bio: bio ?? null,
          status: 'PENDING',
        },
      })

      return { user, provider }
    })

    const token = jwt.sign(
      { id: result.user.id, email: result.user.email, role: result.user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    )

    const response = NextResponse.json({ message: "Compte professionnel créé avec succès" })
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
    return response
  } catch (error: any) {
    console.error("Provider register error:", error)
    return NextResponse.json({ error: error.message ?? "Erreur serveur" }, { status: 500 })
  }
}
