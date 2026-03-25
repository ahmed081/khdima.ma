import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { tMany } from "@/lib/translations"
import type { Locale } from "@/lib/translations"

// Hardcoded fallback names used when Translation table is empty / not migrated yet
const FALLBACK_NAMES: Record<string, Record<string, string>> = {
  PLUMBING:    { fr: 'Plomberie',            en: 'Plumbing',              ar: 'السباكة'        },
  ELECTRICITY: { fr: 'Électricité',           en: 'Electricity',           ar: 'الكهرباء'       },
  CLEANING:    { fr: 'Ménage & Nettoyage',    en: 'Cleaning',              ar: 'التنظيف'        },
  CARPENTRY:   { fr: 'Menuiserie',            en: 'Carpentry',             ar: 'النجارة'        },
  PAINTING:    { fr: 'Peinture',              en: 'Painting',              ar: 'الدهن والطلاء'  },
  HVAC:        { fr: 'Climatisation',         en: 'HVAC / Air Conditioning', ar: 'التكييف'     },
  CAR_WASH:    { fr: 'Lavage Automobile',     en: 'Car Wash',              ar: 'غسيل السيارات'  },
  MOVING:      { fr: 'Déménagement',          en: 'Moving',                ar: 'نقل العفش'      },
  GARDENING:   { fr: 'Jardinage',             en: 'Gardening',             ar: 'البستنة'        },
  SECURITY:    { fr: 'Sécurité',              en: 'Security',              ar: 'الأمن والحراسة' },
  MASONRY:     { fr: 'Maçonnerie',            en: 'Masonry',               ar: 'البناء'         },
  WELDING:     { fr: 'Soudure',               en: 'Welding',               ar: 'اللحام'         },
}

function fallbackName(code: string, locale: Locale): string {
  return FALLBACK_NAMES[code]?.[locale] ?? FALLBACK_NAMES[code]?.['fr'] ?? code
}

export async function GET(req: NextRequest) {
  try {
    const locale = (req.nextUrl.searchParams.get('locale') ?? 'fr') as Locale

    const categories = await prisma.serviceCategory.findMany({
      where:   { isActive: true },
      orderBy: { order: 'asc' },
      include: { _count: { select: { providers: { where: { status: 'ACTIVE' } } } } }
    })

    // tMany is safe — returns {} on error (table missing / empty)
    const codes        = categories.map(c => `CAT_${c.code}`)
    const translations = await tMany(codes, locale)

    const result = categories.map(cat => ({
      id:           cat.id,
      code:         cat.code,
      slug:         cat.slug,
      icon:         cat.icon,
      order:        cat.order,
      // Use Translation table → hardcoded fallback → code
      name:         translations[`CAT_${cat.code}`] || fallbackName(cat.code, locale),
      providerCount: cat._count.providers,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Categories error:", error)
    // Always return an array so the client never gets {error: ...}
    return NextResponse.json([], { status: 200 })
  }
}
