/**
 * Translation helpers — look up codes from the Translation table.
 *
 * Convention:
 *   Category      → "CAT_<CODE>"         e.g. "CAT_PLUMBING"
 *   Category desc → "CAT_<CODE>_DESC"    e.g. "CAT_PLUMBING_DESC"
 *   Subcategory   → "SUBCAT_<CODE>"      e.g. "SUBCAT_PLUMBING_REPAIR"
 *   UI strings    → "UI_<KEY>"           e.g. "UI_SITE_TAGLINE"
 *
 * All functions are resilient: if the Translation table doesn't exist yet
 * (migration pending) they return empty maps / fallback to the code itself.
 */

import { prisma } from '@/lib/prisma'

export type Locale = 'en' | 'fr' | 'ar'

// ---------------------------------------------------------------------------
// Low-level helpers
// ---------------------------------------------------------------------------

/** Fetch a single translation. Falls back locale chain then code on any error. */
export async function t(code: string, locale: Locale): Promise<string> {
  try {
    const result = await prisma.translation.findUnique({
      where: { code_locale: { code, locale } },
      select: { text: true },
    })
    if (result) return result.text

    const fallbacks: Locale[] = (['fr', 'en', 'ar'] as Locale[]).filter(l => l !== locale)
    for (const fb of fallbacks) {
      const fallback = await prisma.translation.findUnique({
        where: { code_locale: { code, locale: fb } },
        select: { text: true },
      })
      if (fallback) return fallback.text
    }
  } catch {
    // Translation table might not exist yet — fall through
  }
  return code
}

/** Fetch multiple translations in one query. Returns a code→text map.
 *  Returns {} on any error so callers can fall back to the code itself. */
export async function tMany(codes: string[], locale: Locale): Promise<Record<string, string>> {
  if (!codes.length) return {}
  try {
    const rows = await prisma.translation.findMany({
      where: { code: { in: codes }, locale },
      select: { code: true, text: true },
    })
    const map: Record<string, string> = {}
    for (const row of rows) map[row.code] = row.text
    return map
  } catch {
    // Translation table might not exist yet
    return {}
  }
}

/** Fetch all translations for a namespace (e.g. 'category') for a given locale. */
export async function tNamespace(namespace: string, locale: Locale): Promise<Record<string, string>> {
  try {
    const rows = await prisma.translation.findMany({
      where: { namespace, locale },
      select: { code: true, text: true },
    })
    const map: Record<string, string> = {}
    for (const row of rows) map[row.code] = row.text
    return map
  } catch {
    return {}
  }
}

// ---------------------------------------------------------------------------
// Domain-specific helpers
// ---------------------------------------------------------------------------

/** Get all active categories with their translated names for a given locale. */
export async function getCategoriesWithTranslations(locale: Locale) {
  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  })

  const codes       = categories.map(c => `CAT_${c.code}`)
  const translations = await tMany(codes, locale)   // safe — never throws

  return categories.map(cat => ({
    ...cat,
    name: translations[`CAT_${cat.code}`] ?? cat.code,
  }))
}

/** Get all subcategories for a category with translated names. */
export async function getSubcategoriesWithTranslations(categoryId: number, locale: Locale) {
  const subcats = await prisma.serviceSubcategory.findMany({ where: { categoryId } })
  const codes   = subcats.map(s => `SUBCAT_${s.code}`)
  const translations = await tMany(codes, locale)

  return subcats.map(sub => ({
    ...sub,
    name: translations[`SUBCAT_${sub.code}`] ?? sub.code,
  }))
}
