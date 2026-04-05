export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { redirect } from "@/i18n/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { tMany } from "@/lib/translations"
import type { Locale } from "@/lib/translations"
import { Link } from "@/i18n/navigation"
import { PublicLayout } from "@/components/public-layout"
import {
  Star, MapPin, MessageCircle, Shield, CheckCircle,
  SlidersHorizontal, ChevronRight, Users, Search, Filter,
} from "lucide-react"

interface Props {
  params: Promise<{ category: string; locale: string }>
  searchParams: Promise<{
    cityId?: string; minRating?: string; availability?: string
    page?: string; q?: string; sort?: string
  }>
}

const CATEGORY_STYLES: Record<string, { gradient: string; light: string; icon: string }> = {
  plumbing:    { gradient: "from-blue-600 to-blue-800",    light: "bg-blue-50 text-blue-700",    icon: "🔧" },
  electricity: { gradient: "from-yellow-500 to-amber-700", light: "bg-amber-50 text-amber-700",  icon: "⚡" },
  cleaning:    { gradient: "from-cyan-500 to-teal-700",    light: "bg-teal-50 text-teal-700",    icon: "🧹" },
  "car-wash":  { gradient: "from-sky-500 to-blue-700",     light: "bg-sky-50 text-sky-700",      icon: "🚗" },
  hvac:        { gradient: "from-indigo-500 to-blue-700",  light: "bg-indigo-50 text-indigo-700",icon: "❄️" },
  carpentry:   { gradient: "from-amber-600 to-orange-700", light: "bg-orange-50 text-orange-700",icon: "🪵" },
  painting:    { gradient: "from-pink-500 to-rose-700",    light: "bg-rose-50 text-rose-700",    icon: "🎨" },
  moving:      { gradient: "from-orange-500 to-red-700",   light: "bg-orange-50 text-orange-700",icon: "📦" },
  gardening:   { gradient: "from-green-500 to-emerald-700",light: "bg-green-50 text-green-700",  icon: "🌿" },
  security:    { gradient: "from-slate-600 to-gray-800",   light: "bg-slate-50 text-slate-700",  icon: "🔒" },
  masonry:     { gradient: "from-stone-500 to-stone-700",  light: "bg-stone-50 text-stone-700",  icon: "🏗️" },
  welding:     { gradient: "from-red-600 to-rose-800",     light: "bg-red-50 text-red-700",      icon: "⚙️" },
  aluminum:    { gradient: "from-zinc-500 to-slate-700",   light: "bg-zinc-50 text-zinc-700",    icon: "🪟" },
}
const DEFAULT_STYLE = { gradient: "from-green-600 to-green-800", light: "bg-green-50 text-green-700", icon: "🔨" }

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3 w-3 ${i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"}`} />
      ))}
    </div>
  )
}

function AvailBadge({ status, locale }: { status: string; locale: string }) {
  const labels: Record<string, Record<string, string>> = {
    AVAILABLE: { fr: "Disponible", ar: "متاح",    en: "Available" },
    BUSY:      { fr: "Occupé",     ar: "مشغول",   en: "Busy" },
    INACTIVE:  { fr: "Inactif",    ar: "غير نشط", en: "Inactive" },
  }
  const colors: Record<string, string> = {
    AVAILABLE: "bg-green-100 text-green-700 border-green-200",
    BUSY:      "bg-amber-100 text-amber-700 border-amber-200",
    INACTIVE:  "bg-gray-100 text-gray-500 border-gray-200",
  }
  const dots: Record<string, string> = {
    AVAILABLE: "bg-green-500", BUSY: "bg-amber-500", INACTIVE: "bg-gray-400",
  }
  const cfg = labels[status] ?? labels.INACTIVE
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${colors[status] ?? colors.INACTIVE}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dots[status] ?? dots.INACTIVE}`} />
      {cfg[locale] ?? cfg.fr}
    </span>
  )
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: slug } = await params
  const sp     = await searchParams
  const locale = await getLocale() as Locale
  const isRTL  = locale === "ar"

  if (/^\d+$/.test(slug)) {
    const prov = await prisma.provider.findUnique({
      where: { id: parseInt(slug) },
      select: { id: true, category: { select: { slug: true } } },
    })
    if (prov) redirect(`/services/${prov.category.slug}/${prov.id}` as never)
    notFound()
  }

  const cat = await prisma.serviceCategory.findUnique({ where: { slug, isActive: true } })
  if (!cat) notFound()

  const page  = Math.max(1, parseInt(sp.page ?? "1"))
  const limit = 12
  const skip  = (page - 1) * limit
  const q     = sp.q?.trim()
  const sort  = sp.sort ?? "rating"

  const where: any = { categoryId: cat.id, status: "ACTIVE" }
  if (sp.cityId)       where.cityId      = parseInt(sp.cityId)
  if (sp.availability) where.availability = sp.availability
  if (sp.minRating)    where.rating       = { gte: parseFloat(sp.minRating) }
  if (q) {
    where.OR = [
      { businessName: { contains: q, mode: "insensitive" } },
      { bio:   { contains: q, mode: "insensitive" } },
      { bioFr: { contains: q, mode: "insensitive" } },
      { city: { nameFr: { contains: q, mode: "insensitive" } } },
    ]
  }

  const orderBy =
    sort === "newest"  ? [{ createdAt: "desc" as const }] :
    sort === "reviews" ? [{ reviewCount: "desc" as const }] :
                         [{ rating: "desc" as const }, { reviewCount: "desc" as const }]

  const [providers, total, cities] = await Promise.all([
    prisma.provider.findMany({
      where, skip, take: limit, orderBy,
      include: {
        city:     true,
        category: true,
        portfolioImages: { where: { status: "APPROVED" }, take: 1, orderBy: { order: "asc" } },
      },
    }),
    prisma.provider.count({ where }),
    prisma.city.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
  ])

  const catCodes     = [...new Set(providers.map(p => `CAT_${p.category.code}`)), `CAT_${cat.code}`]
  const translations = await tMany(catCodes, locale)
  const catName      = translations[`CAT_${cat.code}`] ?? cat.code

  const style      = CATEGORY_STYLES[slug] ?? DEFAULT_STYLE
  const totalPages = Math.ceil(total / limit)
  const ui         = await getTranslations("categoryPage")

  const activeFilterCount = [sp.cityId, sp.availability, sp.minRating].filter(Boolean).length

  function filterHref(overrides: Record<string, string | undefined>) {
    const merged: Record<string, string | undefined> = {
      ...(sp.cityId      && { cityId:       sp.cityId }),
      ...(sp.availability && { availability: sp.availability }),
      ...(sp.minRating   && { minRating:    sp.minRating }),
      ...(q              && { q }),
      ...(sort !== "rating" && { sort }),
      ...overrides,
    }
    Object.keys(merged).forEach(k => merged[k] === undefined && delete merged[k])
    const qs = new URLSearchParams(merged as Record<string, string>).toString()
    return qs ? `?${qs}` : "?"
  }

  const filterForm = (
    <form method="GET" className="space-y-4">
      {q && <input type="hidden" name="q" value={q} />}
      {sort !== "rating" && <input type="hidden" name="sort" value={sort} />}

      {/* City */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          {ui("city")}
        </label>
        <select name="cityId" defaultValue={sp.cityId ?? ""} className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-green-500 focus:outline-none">
          <option value="">{ui("allCities")}</option>
          {cities.map(c => (
            <option key={c.id} value={c.id}>
              {locale === "ar" ? c.nameAr : locale === "fr" ? c.nameFr : c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Availability */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          {ui("availability")}
        </label>
        <select name="availability" defaultValue={sp.availability ?? ""} className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-green-500 focus:outline-none">
          <option value="">{ui("allStatus")}</option>
          <option value="AVAILABLE">{ui("available")}</option>
          <option value="BUSY">{ui("busy")}</option>
        </select>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          {ui("minRating")}
        </label>
        <div className="flex gap-2">
          {[
            { val: "",  label: ui("anyRating") },
            { val: "4", label: "4★+" },
            { val: "3", label: "3★+" },
          ].map(({ val, label }) => (
            <label key={val} className={`flex-1 text-center py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-all ${
              (sp.minRating ?? "") === val
                ? "bg-green-700 text-white border-green-700"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}>
              <input type="radio" name="minRating" value={val} defaultChecked={(sp.minRating ?? "") === val} className="sr-only" />
              {label}
            </label>
          ))}
        </div>
      </div>

      <button type="submit" className="w-full bg-green-700 hover:bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
        {ui("filter")}
      </button>

      {activeFilterCount > 0 && (
        <Link href="?" className="block text-center text-xs text-gray-400 hover:text-gray-600 transition-colors">
          {ui("resetFilters")}
        </Link>
      )}
    </form>
  )

  return (
    <PublicLayout>
      <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-gray-50">

        {/* ── HERO ─────────────────────────────────────────── */}
        <div className={`relative bg-gradient-to-br ${style.gradient} text-white overflow-hidden`}>
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative px-4 sm:px-6 py-8 sm:py-12">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-white/70 text-xs mb-5 flex-wrap">
              <Link href="/" className="hover:text-white transition-colors">{ui("home")}</Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/services" className="hover:text-white transition-colors">{ui("services")}</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white font-medium">{catName}</span>
            </nav>

            <div className="flex items-center gap-4">
              <div className="text-5xl sm:text-6xl select-none drop-shadow-lg">{style.icon}</div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-1">{catName}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    <Users className="h-3.5 w-3.5" />
                    {total} {ui("providers")}
                    {q && ` — "${q}"`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SEARCH + MOBILE FILTER TOGGLE ─────────────────── */}
        <div className="bg-white border-b shadow-sm px-4 sm:px-6 py-3">
          <form method="GET" className="flex gap-2">
            {sp.cityId      && <input type="hidden" name="cityId"       value={sp.cityId} />}
            {sp.availability && <input type="hidden" name="availability" value={sp.availability} />}
            {sp.minRating   && <input type="hidden" name="minRating"    value={sp.minRating} />}
            {sort !== "rating" && <input type="hidden" name="sort"       value={sort} />}
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                name="q"
                defaultValue={q}
                placeholder={ui("searchPlaceholder")}
                className="w-full ps-9 pe-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button type="submit" className="px-4 py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 flex-shrink-0">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">{ui("filter")}</span>
            </button>
          </form>
        </div>

        <div className="px-4 sm:px-6 py-5">
          <div className="flex gap-6">

            {/* ── DESKTOP SIDEBAR ───────────────────────────── */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="sticky top-24 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-gray-50 border-b px-4 py-3 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold text-sm text-gray-700">{ui("filters")}</span>
                  {activeFilterCount > 0 && (
                    <span className="ms-auto text-xs bg-green-700 text-white rounded-full px-2 py-0.5 font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <div className="p-4">{filterForm}</div>
              </div>
            </aside>

            {/* ── MAIN CONTENT ──────────────────────────────── */}
            <div className="flex-1 min-w-0">

              {/* Mobile filter collapse */}
              <details className="lg:hidden mb-4 group">
                <summary className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 py-3 cursor-pointer list-none select-none hover:border-green-300 transition-colors">
                  <div className="flex items-center gap-2 font-semibold text-sm text-gray-700">
                    <SlidersHorizontal className="h-4 w-4" />
                    {ui("filters")}
                    {activeFilterCount > 0 && (
                      <span className="bg-green-700 text-white text-xs rounded-full px-2 py-0.5 font-bold">{activeFilterCount}</span>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 transition-transform duration-200 group-open:rotate-90" />
                </summary>
                <div className="mt-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
                  {filterForm}
                </div>
              </details>

              {/* Sort + count bar */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <p className="text-sm text-gray-500">
                  {total > 0 && (
                    <><span className="font-bold text-gray-800">{total}</span> {ui("providers")}</>
                  )}
                </p>
                <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
                  {[
                    { key: "rating",  label: ui("sortRating") },
                    { key: "reviews", label: ui("sortReviews") },
                    { key: "newest",  label: ui("sortNewest") },
                  ].map(opt => (
                    <Link
                      key={opt.key}
                      href={filterHref({ sort: opt.key === "rating" ? undefined : opt.key, page: undefined })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        sort === opt.key || (opt.key === "rating" && !sp.sort)
                          ? "bg-green-700 text-white shadow-sm"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* ── PROVIDER GRID ─────────────────────────────── */}
              {providers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                  <div className="text-5xl mb-4 opacity-30">{style.icon}</div>
                  <h3 className="text-lg font-bold text-gray-700 mb-2">{ui("noResults")}</h3>
                  <p className="text-sm text-gray-400 max-w-xs mb-5">{ui("noResultsSub")}</p>
                  {(sp.cityId || sp.availability || sp.minRating || q) && (
                    <Link href="?" className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:underline">
                      <Filter className="h-3.5 w-3.5" />
                      {ui("removeFilters")}
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {providers.map(provider => {
                    const cityName = locale === "ar" ? provider.city.nameAr : locale === "fr" ? provider.city.nameFr : provider.city.name
                    const cover    = provider.portfolioImages[0]

                    return (
                      <article key={provider.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-green-100 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col group">

                        {/* Cover image / gradient header */}
                        <div className="relative h-36 overflow-hidden bg-gray-100">
                          {cover ? (
                            <img
                              src={cover.url}
                              alt={cover.caption ?? provider.businessName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${style.gradient} opacity-20`} />
                          )}
                          {/* Overlay gradient for text readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                          {/* Top-left: availability */}
                          <div className="absolute top-2.5 start-2.5">
                            <AvailBadge status={provider.availability} locale={locale} />
                          </div>

                          {/* Top-right: verified */}
                          {provider.isVerified && (
                            <div className="absolute top-2.5 end-2.5 w-6 h-6 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                              <Shield className="h-3.5 w-3.5 text-green-600" />
                            </div>
                          )}
                        </div>

                        {/* Avatar overlapping cover */}
                        <div className="relative px-4 -mt-7">
                          <div className="w-14 h-14 rounded-2xl border-2 border-white shadow-md overflow-hidden bg-green-100 flex items-center justify-center text-xl font-extrabold text-green-700 flex-shrink-0">
                            {provider.avatarUrl
                              ? <img src={provider.avatarUrl} alt={provider.businessName} className="w-full h-full object-cover" />
                              : provider.businessName?.[0]
                            }
                          </div>
                        </div>

                        {/* Content */}
                        <div className="px-4 pt-2 pb-4 flex-1 flex flex-col">
                          {/* Name */}
                          <h3 className="font-bold text-gray-900 text-sm truncate leading-tight">{provider.businessName}</h3>

                          {/* Location + experience */}
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5 mb-2.5 flex-wrap">
                            <span className="flex items-center gap-0.5">
                              <MapPin className="h-3 w-3" />{cityName}
                            </span>
                            {provider.yearsExperience && (
                              <span className="flex items-center gap-0.5">
                                · {provider.yearsExperience} {ui("experience")}
                              </span>
                            )}
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-1.5 mb-4">
                            <StarRating rating={provider.rating} />
                            <span className="text-xs font-semibold text-gray-700">
                              {provider.rating > 0 ? provider.rating.toFixed(1) : "—"}
                            </span>
                            <span className="text-xs text-gray-400">
                              ({provider.reviewCount} {ui("reviews")})
                            </span>
                          </div>

                          {/* Action buttons */}
                          <div className="mt-auto flex gap-2">
                            {provider.whatsapp && (
                              <a
                                href={`https://wa.me/${provider.whatsapp.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-500 active:bg-green-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors touch-manipulation"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                                {ui("whatsapp")}
                              </a>
                            )}
                            <Link
                              href={`/services/${provider.category.slug}/${provider.id}`}
                              className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 hover:border-green-300 hover:bg-green-50 active:bg-green-100 text-gray-700 hover:text-green-700 text-xs font-semibold py-2.5 rounded-xl transition-colors touch-manipulation"
                            >
                              {ui("viewProfile")}
                            </Link>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}

              {/* ── PAGINATION ────────────────────────────────── */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-1.5 mt-10 flex-wrap">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pg = i + 1
                    return (
                      <Link
                        key={pg}
                        href={filterHref({ page: pg === 1 ? undefined : String(pg) })}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-all touch-manipulation ${
                          pg === page
                            ? "bg-green-700 text-white shadow-md"
                            : "bg-white border border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-700"
                        }`}
                      >
                        {pg}
                      </Link>
                    )
                  })}
                </div>
              )}

              {/* ── JOIN CTA ──────────────────────────────────── */}
              <div className={`mt-10 rounded-2xl bg-gradient-to-br ${style.gradient} text-white p-6 sm:p-8 text-center shadow-lg`}>
                <div className="text-4xl mb-3 drop-shadow">{style.icon}</div>
                <h3 className="text-lg sm:text-xl font-extrabold mb-2">{ui("joinCta", { catName })}</h3>
                <p className="text-white/80 mb-5 text-sm max-w-sm mx-auto">{ui("joinSub")}</p>
                <Link
                  href="/provider/register"
                  className="inline-flex items-center gap-2 bg-white text-green-800 hover:bg-green-50 font-bold px-6 py-3 rounded-full transition-all hover:shadow-lg hover:-translate-y-0.5 text-sm touch-manipulation"
                >
                  <CheckCircle className="h-4 w-4" />
                  {ui("joinBtn")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
