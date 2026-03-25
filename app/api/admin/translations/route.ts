import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromAuth } from "@/lib/auth"

// GET — list translations with optional filters
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = req.nextUrl
    const namespace = searchParams.get('namespace')
    const q         = searchParams.get('q')
    const page      = parseInt(searchParams.get('page') ?? '1')
    const limit     = parseInt(searchParams.get('limit') ?? '50')

    const where: any = {}
    if (namespace) where.namespace = namespace
    if (q) {
      where.OR = [
        { code: { contains: q, mode: 'insensitive' } },
        { text: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [translations, total] = await Promise.all([
      prisma.translation.findMany({
        where,
        orderBy: [{ code: 'asc' }, { locale: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.translation.count({ where }),
    ])

    // Group by code for cleaner display
    const grouped: Record<string, any> = {}
    for (const t of translations) {
      if (!grouped[t.code]) {
        grouped[t.code] = { code: t.code, namespace: t.namespace, locales: {} }
      }
      grouped[t.code].locales[t.locale] = t.text
    }

    return NextResponse.json({ translations: Object.values(grouped), total, page, limit })
  } catch (error) {
    console.error("Translations GET error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// PUT — upsert a single translation entry
export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { code, locale, text, namespace } = await req.json()

    if (!code || !locale || !text) {
      return NextResponse.json({ error: "code, locale, text required" }, { status: 400 })
    }

    const result = await prisma.translation.upsert({
      where: { code_locale: { code, locale } },
      update: { text, ...(namespace && { namespace }) },
      create: { code, locale, text, namespace: namespace ?? 'general' },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Translations PUT error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// DELETE — remove a translation entry
export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    await prisma.translation.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Translations DELETE error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
