import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromAuth } from "@/lib/auth"

type Params = { params: Promise<{ profileId: string }> }

// GET — all pending photos for a specific provider
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { profileId } = await params
    const providerId = parseInt(profileId)

    if (isNaN(providerId)) {
      return NextResponse.json({ error: "Invalid profileId" }, { status: 400 })
    }

    const [provider, portfolioPhotos] = await Promise.all([
      prisma.provider.findUnique({
        where: { id: providerId },
        select: {
          id: true,
          businessName: true,
          avatarUrl: true,
          pendingAvatarUrl: true,
          createdAt: true,
          category: { select: { code: true } },
          user: { select: { name: true, email: true, createdAt: true } },
        },
      }),
      prisma.portfolioImage.findMany({
        where: { providerId, status: "PENDING" },
        orderBy: { createdAt: "asc" },
      }),
    ])

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    return NextResponse.json({ provider, portfolioPhotos })
  } catch (error) {
    console.error("Admin photos/[profileId] GET error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// PATCH — approve or reject a photo (profile avatar or portfolio image)
// Body for portfolio: { type: "portfolio", id: number, status: "APPROVED"|"REJECTED", adminNote?: string }
// Body for profile:   { type: "profile", providerId: number, action: "APPROVED"|"REJECTED", adminNote?: string }
// Body for bulk:      { type: "portfolio", bulk: true, providerId: number }
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { profileId } = await params
    const providerId = parseInt(profileId)

    if (isNaN(providerId)) {
      return NextResponse.json({ error: "Invalid profileId" }, { status: 400 })
    }

    const body = await req.json()
    const { type } = body

    if (type === "profile") {
      const { action, adminNote } = body
      if (!["APPROVED", "REJECTED"].includes(action)) {
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
      }

      const provider = await prisma.provider.findUnique({
        where: { id: providerId },
        select: { pendingAvatarUrl: true },
      })

      if (!provider?.pendingAvatarUrl) {
        return NextResponse.json({ error: "No pending profile photo" }, { status: 404 })
      }

      if (action === "APPROVED") {
        await prisma.provider.update({
          where: { id: providerId },
          data: {
            avatarUrl: provider.pendingAvatarUrl,
            pendingAvatarUrl: null,
          },
        })
      } else {
        // REJECTED — just clear the pending, optionally log the note
        await prisma.provider.update({
          where: { id: providerId },
          data: {
            pendingAvatarUrl: null,
            ...(adminNote ? { adminNotes: adminNote } : {}),
          },
        })
      }

      return NextResponse.json({ ok: true })
    }

    if (type === "portfolio") {
      const { bulk, id, status, adminNote } = body

      if (bulk) {
        // Approve all pending portfolio photos for this provider
        await prisma.portfolioImage.updateMany({
          where: { providerId, status: "PENDING" },
          data: { status: "APPROVED", reviewedAt: new Date() },
        })
        return NextResponse.json({ ok: true })
      }

      if (!id || !["APPROVED", "REJECTED"].includes(status)) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 })
      }

      await prisma.portfolioImage.update({
        where: { id: parseInt(id) },
        data: { status, adminNote: adminNote ?? null, reviewedAt: new Date() },
      })

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    console.error("Admin photos/[profileId] PATCH error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
