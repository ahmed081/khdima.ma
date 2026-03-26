import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromAuth } from "@/lib/auth"

type Params = { params: Promise<{ id: string }> }

// GET — list subcategories for a category with all translations
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const categoryId = parseInt(id)

    const subcats = await prisma.serviceSubcategory.findMany({
      where: { categoryId },
      orderBy: { code: "asc" },
      include: { _count: { select: { providers: true } } },
    })

    const codes = subcats.map((s) => `SUBCAT_${s.code}`)
    const translations = await prisma.translation.findMany({
      where: { code: { in: codes } },
    })
    const tMap: Record<string, Record<string, string>> = {}
    for (const tr of translations) {
      if (!tMap[tr.code]) tMap[tr.code] = {}
      tMap[tr.code][tr.locale] = tr.text
    }

    return NextResponse.json(
      subcats.map((s) => ({
        id: s.id,
        code: s.code,
        slug: s.slug,
        translations: tMap[`SUBCAT_${s.code}`] ?? {},
        providerCount: s._count.providers,
      }))
    )
  } catch (err) {
    console.error("Admin subcategories GET error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// POST — create subcategory under this category
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const categoryId = parseInt(id)
    const { code, slug, fr, en, ar } = await req.json()

    if (!code || !slug)
      return NextResponse.json({ error: "code and slug are required" }, { status: 400 })

    const subcat = await prisma.serviceSubcategory.create({
      data: { code: code.toUpperCase(), slug: slug.toLowerCase(), categoryId },
    })

    for (const { locale, text } of [
      { locale: "fr", text: fr },
      { locale: "en", text: en },
      { locale: "ar", text: ar },
    ]) {
      if (text) {
        await prisma.translation.upsert({
          where: { code_locale: { code: `SUBCAT_${subcat.code}`, locale: locale as any } },
          update: { text, namespace: "subcategory" },
          create: { code: `SUBCAT_${subcat.code}`, locale: locale as any, text, namespace: "subcategory" },
        })
      }
    }

    return NextResponse.json(subcat, { status: 201 })
  } catch (err: any) {
    if (err.code === "P2002")
      return NextResponse.json({ error: "Code or slug already exists" }, { status: 409 })
    console.error("Admin subcategories POST error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// PATCH — update subcategory translations
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { subcatId, fr, en, ar } = await req.json()
    if (!subcatId)
      return NextResponse.json({ error: "subcatId required" }, { status: 400 })

    const subcat = await prisma.serviceSubcategory.findUnique({ where: { id: parseInt(subcatId) } })
    if (!subcat) return NextResponse.json({ error: "Not found" }, { status: 404 })

    for (const { locale, text } of [
      { locale: "fr", text: fr },
      { locale: "en", text: en },
      { locale: "ar", text: ar },
    ]) {
      if (text !== undefined) {
        await prisma.translation.upsert({
          where: { code_locale: { code: `SUBCAT_${subcat.code}`, locale: locale as any } },
          update: { text, namespace: "subcategory" },
          create: { code: `SUBCAT_${subcat.code}`, locale: locale as any, text, namespace: "subcategory" },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Admin subcategories PATCH error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// DELETE — remove subcategory (only if no providers linked)
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await getUserFromAuth()
    if (!user || user.role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { subcatId } = await req.json()
    if (!subcatId)
      return NextResponse.json({ error: "subcatId required" }, { status: 400 })

    const count = await prisma.providerSubcategory.count({ where: { subcategoryId: parseInt(subcatId) } })
    if (count > 0)
      return NextResponse.json({ error: `Cannot delete — ${count} provider(s) use this subcategory` }, { status: 409 })

    await prisma.serviceSubcategory.delete({ where: { id: parseInt(subcatId) } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Admin subcategories DELETE error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
