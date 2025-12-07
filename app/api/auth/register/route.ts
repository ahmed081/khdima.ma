import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(req: Request) {
    try {
        const { name, email, phone, password, role } = await req.json()

        if (!name || !email || !password || !role) {
            return NextResponse.json(
                { error: "Veuillez remplir tous les champs obligatoires." },
                { status: 400 }
            )
        }

        // FULL TRANSACTION
        const result = await prisma.$transaction(async (tx) => {

            // Check duplicate inside transaction (prevents race condition)
            const existing = await tx.user.findUnique({
                where: { email },
            })

            if (existing) {
                throw new Error("Cet email est déjà utilisé.")
            }

            // Hash password (can safely be inside or outside transaction)
            const hashedPassword = await bcrypt.hash(password, 10)

            // Create user ATOMICALLY
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    phone,
                    role: role === "employer" ? "EMPLOYER" : "JOB_SEEKER",
                    password: hashedPassword,
                },
            })

            return user
        })

        // Create JWT
        const token = jwt.sign(
            {
                id: result.id,
                email: result.email,
                role: result.role,
            },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        )

        // Set HttpOnly cookie
        const response = NextResponse.json({ message: "Compte créé avec succès" })
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        })

        return response

    } catch (error: any) {
        console.error("Register TX error:", error)

        return NextResponse.json(
            { error: error.message ?? "Erreur serveur" },
            { status: 500 }
        )
    }
}
