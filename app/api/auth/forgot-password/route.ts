import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })

    // Always return success (don't leak whether email exists)
    if (!user) {
      return NextResponse.json({ message: "If this email is registered, a reset link has been sent." })
    }

    // Invalidate old tokens
    await prisma.passwordResetToken.updateMany({
      where: { email: user.email, usedAt: null, expiresAt: { gt: new Date() } },
      data:  { expiresAt: new Date() },
    })

    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.passwordResetToken.create({
      data: { email: user.email, token, expiresAt },
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/fr/reset-password?token=${token}`

    // In production, send email here.
    // For now, log the link to console (replace with your email provider).
    console.log(`[Password Reset] ${user.email} → ${resetUrl}`)

    // Try to send email if SMTP_HOST is configured
    if (process.env.SMTP_HOST) {
      try {
        const nodemailer = await import("nodemailer")
        const transporter = nodemailer.createTransport({
          host:   process.env.SMTP_HOST,
          port:   parseInt(process.env.SMTP_PORT ?? "587"),
          secure: process.env.SMTP_SECURE === "true",
          auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        })
        await transporter.sendMail({
          from:    process.env.SMTP_FROM ?? "noreply@khdimti.com",
          to:      user.email,
          subject: "Réinitialisation de votre mot de passe — khdimti.com",
          html: `
            <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
              <h2>Réinitialisation du mot de passe</h2>
              <p>Bonjour ${user.name},</p>
              <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe. Ce lien expire dans 24 heures.</p>
              <a href="${resetUrl}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Réinitialiser mon mot de passe</a>
              <p style="color:#6b7280;font-size:12px">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            </div>
          `,
        })
      } catch (emailError) {
        console.error("[Email] Failed to send reset email:", emailError)
      }
    }

    return NextResponse.json({ message: "If this email is registered, a reset link has been sent." })
  } catch (error) {
    console.error("[forgot-password]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
