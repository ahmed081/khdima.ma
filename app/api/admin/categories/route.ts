import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromAuth } from "@/lib/auth"

// GET — list all categories with their translations
export async function GET() {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const categories = await prisma.serviceCategory.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { providers: true, subcategories: true } } }
    })

    const codes = categories.map(c => `CAT_${c.code}`)
    const translations = await prisma.translation.findMany({
      where: { code: { in: codes } },
    })
    const tMap: Record<string, Record<string, string>> = {}
    for (const tr of translations) {
      if (!tMap[tr.code]) tMap[tr.code] = {}
      tMap[tr.code][tr.locale] = tr.text
    }

    const result = categories.map(cat => ({
      id:       cat.id,
      code:     cat.code,
      slug:     cat.slug,
      icon:     cat.icon,
      order:    cat.order,
      isActive: cat.isActive,
      translations: tMap[`CAT_${cat.code}`] ?? {},
      providerCount:    cat._count.providers,
      subcategoryCount: cat._count.subcategories,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Admin categories GET error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// POST — create a new category
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { code, slug, icon, order, fr, en, ar } = await req.json()

    if (!code || !slug) {
      return NextResponse.json({ error: "code and slug are required" }, { status: 400 })
    }

    const category = await prisma.serviceCategory.create({
      data: { code: code.toUpperCase(), slug, icon, order: order ?? 0, isActive: true }
    })

    // Create translations
    const locales = [{ locale: 'fr', text: fr }, { locale: 'en', text: en }, { locale: 'ar', text: ar }]
    for (const { locale, text } of locales) {
      if (text) {
        await prisma.translation.upsert({
          where: { code_locale: { code: `CAT_${category.code}`, locale: locale as any } },
          update: { text, namespace: 'category' },
          create: { code: `CAT_${category.code}`, locale: locale as any, text, namespace: 'category' },
        })
      }
    }

    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Code or slug already exists" }, { status: 409 })
    }
    console.error("Admin categories POST error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// PATCH — update category (toggle active, icon, order, translations)
export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, isActive, icon, order, fr, en, ar } = await req.json()
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    const category = await prisma.serviceCategory.findUnique({ where: { id: parseInt(id) } })
    if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 })

    await prisma.serviceCategory.update({
      where: { id: category.id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(icon !== undefined && { icon }),
        ...(order !== undefined && { order }),
      }
    })

    // Update translations
    const locales = [{ locale: 'fr', text: fr }, { locale: 'en', text: en }, { locale: 'ar', text: ar }]
    for (const { locale, text } of locales) {
      if (text !== undefined) {
        await prisma.translation.upsert({
          where: { code_locale: { code: `CAT_${category.code}`, locale: locale as any } },
          update: { text, namespace: 'category' },
          create: { code: `CAT_${category.code}`, locale: locale as any, text, namespace: 'category' },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin categories PATCH error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
