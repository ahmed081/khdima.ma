import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json()

        if (!email || !password) {
            return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 })
        }

        // Check user exists
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 })
        }

        // Compare password
        const valid = await bcrypt.compare(password, user.password)
        if (!valid) {
            return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 })
        }

        // Create JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        )

        // Set HttpOnly cookie
        const response = NextResponse.json({ message: "Connexion réussie" })
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        })

        return response
    } catch (error) {
        console.error("Login error:", error)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}
