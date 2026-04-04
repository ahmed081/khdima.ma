import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromAuth } from "@/lib/auth"

// GET — list portfolio images for the authenticated provider
export async function GET() {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== 'PROVIDER') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const provider = await prisma.provider.findUnique({ where: { userId: user.id } })
    if (!provider) return NextResponse.json({ error: "Provider not found" }, { status: 404 })

    const images = await prisma.portfolioImage.findMany({
      where: { providerId: provider.id },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error("Portfolio GET error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// POST — add a portfolio image
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== 'PROVIDER') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const provider = await prisma.provider.findUnique({ where: { userId: user.id } })
    if (!provider) return NextResponse.json({ error: "Provider not found" }, { status: 404 })

    // Check limit
    const maxImages = parseInt(
      (await prisma.param.findUnique({ where: { key: 'MAX_PORTFOLIO_IMAGES' } }))?.value ?? '10'
    )
    const count = await prisma.portfolioImage.count({ where: { providerId: provider.id } })
    if (count >= maxImages) {
      return NextResponse.json({ error: `Maximum ${maxImages} images allowed` }, { status: 400 })
    }

    const { url, caption } = await req.json()

    if (!url || typeof url !== 'string' || (!url.startsWith('http') && !url.startsWith('/'))) {
      return NextResponse.json({ error: "Valid image URL required" }, { status: 400 })
    }

    const image = await prisma.portfolioImage.create({
      data: {
        providerId: provider.id,
        url,
        caption: caption ?? null,
        order:    count,
        status:   "PENDING",
      }
    })

    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    console.error("Portfolio POST error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// DELETE — remove a portfolio image
export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== 'PROVIDER') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const provider = await prisma.provider.findUnique({ where: { userId: user.id } })
    if (!provider) return NextResponse.json({ error: "Provider not found" }, { status: 404 })

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: "Image ID required" }, { status: 400 })

    const image = await prisma.portfolioImage.findFirst({
      where: { id: parseInt(id), providerId: provider.id }
    })
    if (!image) return NextResponse.json({ error: "Image not found" }, { status: 404 })

    await prisma.portfolioImage.delete({ where: { id: image.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Portfolio DELETE error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
