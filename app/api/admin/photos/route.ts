import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromAuth } from "@/lib/auth"

// GET — list portfolio images pending review (or all with status filter)
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const status = req.nextUrl.searchParams.get("status") ?? "PENDING"

    const images = await prisma.portfolioImage.findMany({
      where: status === "ALL" ? undefined : { status: status as any },
      orderBy: { createdAt: "desc" },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error("Admin photos GET error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// PATCH — approve or reject a portfolio image
export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, status, adminNote } = await req.json()

    if (!id || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const image = await prisma.portfolioImage.update({
      where: { id: parseInt(id) },
      data: {
        status,
        adminNote: adminNote ?? null,
        reviewedAt: new Date(),
      },
    })

    return NextResponse.json(image)
  } catch (error) {
    console.error("Admin photos PATCH error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
