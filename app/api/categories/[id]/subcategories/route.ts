import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { tMany } from "@/lib/translations"
import type { Locale } from "@/lib/translations"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const locale = (req.nextUrl.searchParams.get("locale") ?? "fr") as Locale
    const categoryId = parseInt(id)

    const subcats = await prisma.serviceSubcategory.findMany({
      where: { categoryId },
      orderBy: { code: "asc" },
    })

    const codes = subcats.map((s) => `SUBCAT_${s.code}`)
    const translations = await tMany(codes, locale)

    return NextResponse.json(
      subcats.map((s) => ({
        id: s.id,
        code: s.code,
        slug: s.slug,
        name: translations[`SUBCAT_${s.code}`] ?? s.code,
      }))
    )
  } catch (err) {
    console.error("Subcategories error:", err)
    return NextResponse.json([], { status: 200 })
  }
}
