import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { redirect } from "@/i18n/navigation"
import { getLocale } from "next-intl/server"
import { tMany } from "@/lib/translations"
import type { Locale } from "@/lib/translations"
import { Link } from "@/i18n/navigation"
import { PublicLayout } from "@/components/public-layout"
import {
  Star, MapPin, MessageCircle, Phone, Shield, CheckCircle,
  SlidersHorizontal, ChevronRight, Users, Search, Filter
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Props {
  params: Promise<{ category: string; locale: string }>
  searchParams: Promise<{
    cityId?: string; minRating?: string; availability?: string
    page?: string; q?: string; sort?: string
  }>
}

// Category hero gradients (mapped by slug)
const CATEGORY_STYLES: Record<string, { gradient: string; icon: string }> = {
  plumbing:    { gradient: "from-blue-600 to-blue-800",   icon: "🔧" },
  electricity: { gradient: "from-yellow-500 to-amber-700", icon: "⚡" },
  cleaning:    { gradient: "from-cyan-500 to-teal-700",    icon: "🧹" },
  "car-wash":  { gradient: "from-sky-500 to-blue-700",    icon: "🚗" },
  hvac:        { gradient: "from-indigo-500 to-blue-700", icon: "❄️" },
  carpentry:   { gradient: "from-amber-600 to-orange-700", icon: "🪵" },
  painting:    { gradient: "from-pink-500 to-rose-700",   icon: "🎨" },
  moving:      { gradient: "from-orange-500 to-red-700",  icon: "📦" },
  gardening:   { gradient: "from-green-500 to-emerald-700", icon: "🌿" },
  security:    { gradient: "from-slate-600 to-gray-800",  icon: "🔒" },
  masonry:     { gradient: "from-stone-500 to-stone-700", icon: "🏗️" },
  welding:     { gradient: "from-red-600 to-rose-800",    icon: "⚙️" },
  aluminum:    { gradient: "from-zinc-500 to-slate-700",  icon: "🪟" },
}

const DEFAULT_STYLE = { gradient: "from-green-600 to-green-800", icon: "🔨" }

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${sz} ${i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"}`}
        />
      ))}
    </div>
  )
}

function AvailabilityBadge({ status, locale }: { status: string; locale: string }) {
  const configs: Record<string, { color: string; label: Record<string, string> }> = {
    AVAILABLE: { color: "bg-green-100 text-green-700 border-green-200", label: { fr: "Disponible", ar: "متاح", en: "Available" } },
    BUSY:      { color: "bg-amber-100 text-amber-700 border-amber-200", label: { fr: "Occupé", ar: "مشغول", en: "Busy" } },
    INACTIVE:  { color: "bg-gray-100 text-gray-500 border-gray-200",   label: { fr: "Inactif", ar: "غير نشط", en: "Inactive" } },
  }
  const cfg = configs[status] ?? configs.INACTIVE
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "AVAILABLE" ? "bg-green-500" : status === "BUSY" ? "bg-amber-500" : "bg-gray-400"}`} />
      {cfg.label[locale] ?? cfg.label.fr}
    </span>
  )
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: slug } = await params
  const sp     = await searchParams
  const locale = await getLocale() as Locale
  const isRTL  = locale === "ar"

  // If slug is a pure number it's a provider-id shortcut (e.g. /ar/services/6).
  // Resolve the provider's category and redirect to the canonical URL.
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
  if (sp.cityId)      where.cityId      = parseInt(sp.cityId)
  if (sp.availability) where.availability = sp.availability
  if (sp.minRating)   where.rating       = { gte: parseFloat(sp.minRating) }
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
        portfolioImages: { take: 3, orderBy: { order: "asc" } },
      },
    }),
    prisma.provider.count({ where }),
    prisma.city.findMany({ orderBy: { name: "asc" } }),
  ])

  const catCodes     = [...new Set(providers.map(p => `CAT_${p.category.code}`)), `CAT_${cat.code}`]
  const translations = await tMany(catCodes, locale)
  const catName      = translations[`CAT_${cat.code}`] ?? cat.code

  const style      = CATEGORY_STYLES[slug] ?? DEFAULT_STYLE
  const totalPages = Math.ceil(total / limit)

  // Localised UI strings (inline to avoid extra DB round-trips for simple labels)
  const ui = {
    services:    locale === "ar" ? "الخدمات"          : locale === "fr" ? "Services"          : "Services",
    allCities:   locale === "ar" ? "كل المدن"         : locale === "fr" ? "Toutes les villes" : "All cities",
    allStatus:   locale === "ar" ? "كل الحالات"        : locale === "fr" ? "Toutes"            : "All",
    available:   locale === "ar" ? "متاح"             : locale === "fr" ? "Disponible"        : "Available",
    busy:        locale === "ar" ? "مشغول"            : locale === "fr" ? "Occupé"            : "Busy",
    anyRating:   locale === "ar" ? "أي تقييم"         : locale === "fr" ? "Toute note"        : "Any rating",
    filter:      locale === "ar" ? "تصفية"            : locale === "fr" ? "Filtrer"           : "Filter",
    noResults:   locale === "ar" ? "لم يتم إيجاد محترفين" : locale === "fr" ? "Aucun professionnel trouvé" : "No providers found",
    noResultsSub:locale === "ar" ? "جرب تعديل المرشحات أو ابحث بكلمة مختلفة" : locale === "fr" ? "Essayez d'ajuster les filtres ou cherchez un autre mot" : "Try adjusting filters or search with different keywords",
    viewProfile: locale === "ar" ? "عرض الملف الشخصي": locale === "fr" ? "Voir le profil"     : "View profile",
    whatsapp:    locale === "ar" ? "واتساب"           : locale === "fr" ? "WhatsApp"          : "WhatsApp",
    call:        locale === "ar" ? "اتصال"            : locale === "fr" ? "Appeler"           : "Call",
    verified:    locale === "ar" ? "موثوق"            : locale === "fr" ? "Vérifié"           : "Verified",
    experience:  locale === "ar" ? "سنوات خبرة"      : locale === "fr" ? "ans d'expérience"  : "years experience",
    reviews:     locale === "ar" ? "تقييم"            : locale === "fr" ? "avis"              : "reviews",
    providers:   locale === "ar" ? "محترف"            : locale === "fr" ? "professionnel(s)"  : "provider(s)",
    sortBy:      locale === "ar" ? "ترتيب حسب"        : locale === "fr" ? "Trier par"         : "Sort by",
    sortRating:  locale === "ar" ? "الأعلى تقييمًا"   : locale === "fr" ? "Mieux notés"       : "Highest rated",
    sortReviews: locale === "ar" ? "الأكثر تقييمًا"   : locale === "fr" ? "Plus d'avis"       : "Most reviews",
    sortNewest:  locale === "ar" ? "الأحدث"           : locale === "fr" ? "Plus récents"      : "Newest",
    joinCta:     locale === "ar" ? `هل أنت محترف في ${catName}؟` : locale === "fr" ? `Vous êtes un professionnel en ${catName} ?` : `Are you a ${catName} professional?`,
    joinSub:     locale === "ar" ? "انضم إلى آلاف المحترفين على خديمتي.كوم" : locale === "fr" ? "Rejoignez des milliers de professionnels sur khdimti.com" : "Join thousands of professionals on khdimti.com",
    joinBtn:     locale === "ar" ? "سجّل نشاطك"       : locale === "fr" ? "Inscrivez votre activité" : "List your business",
    searchPlaceholder: locale === "ar" ? "ابحث عن محترف..." : locale === "fr" ? "Rechercher un professionnel..." : "Search for a professional...",
  }

  // Build filter query string helper
  function filterHref(overrides: Record<string, string | undefined>) {
    const merged = {
      ...(sp.cityId      && { cityId:      sp.cityId }),
      ...(sp.availability && { availability: sp.availability }),
      ...(sp.minRating   && { minRating:   sp.minRating }),
      ...(q              && { q }),
      ...(sort !== "rating" && { sort }),
      ...overrides,
    }
    Object.keys(merged).forEach(k => merged[k] === undefined && delete merged[k])
    const qs = new URLSearchParams(merged as Record<string, string>).toString()
    return qs ? `?${qs}` : "?"
  }

  return (
    <PublicLayout>
      <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen">

        {/* ── HERO SECTION ─────────────────────────────────────────────── */}
        <div className={`relative bg-gradient-to-br ${style.gradient} text-white overflow-hidden`}>
          {/* decorative circles */}
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative px-6 py-12">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-white/70 text-sm mb-6">
              <Link href="/" className="hover:text-white transition-colors">
                {locale === "ar" ? "الرئيسية" : locale === "fr" ? "Accueil" : "Home"}
              </Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/services" className="hover:text-white transition-colors">{ui.services}</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white font-medium">{catName}</span>
            </nav>

            <div className="flex items-center gap-5">
              <div className="text-6xl select-none">{style.icon}</div>
              <div>
                <h1 className="text-4xl font-bold mb-2">{catName}</h1>
                <p className="text-white/80 text-lg">
                  {total} {ui.providers}
                  {q && ` — "${q}"`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── SEARCH BAR ───────────────────────────────────────────────── */}
        <div className="bg-white border-b shadow-sm px-6 py-4">
          <form method="GET" className="flex gap-2">
            {/* preserve other filters */}
            {sp.cityId      && <input type="hidden" name="cityId"       value={sp.cityId} />}
            {sp.availability && <input type="hidden" name="availability" value={sp.availability} />}
            {sp.minRating   && <input type="hidden" name="minRating"    value={sp.minRating} />}
            {sort !== "rating" && <input type="hidden" name="sort"       value={sort} />}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                name="q"
                defaultValue={q}
                placeholder={ui.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button type="submit" className="px-5 py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {ui.filter}
            </button>
          </form>
        </div>

        <div className="px-4 py-6">
          <div className="flex gap-6">

            {/* ── FILTER SIDEBAR ─────────────────────────────────────────── */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gray-50 border-b px-4 py-3 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold text-sm text-gray-700">
                    {locale === "ar" ? "المرشحات" : locale === "fr" ? "Filtres" : "Filters"}
                  </span>
                </div>
                <form method="GET" className="p-4 space-y-5">
                  {q && <input type="hidden" name="q" value={q} />}
                  {sort !== "rating" && <input type="hidden" name="sort" value={sort} />}

                  {/* City */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      {locale === "ar" ? "المدينة" : locale === "fr" ? "Ville" : "City"}
                    </label>
                    <select name="cityId" defaultValue={sp.cityId ?? ""} className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-green-500 focus:outline-none">
                      <option value="">{ui.allCities}</option>
                      {cities.map(c => (
                        <option key={c.id} value={c.id}>
                          {locale === "ar" ? c.nameAr : locale === "fr" ? c.nameFr : c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      {locale === "ar" ? "الحالة" : locale === "fr" ? "Disponibilité" : "Availability"}
                    </label>
                    <select name="availability" defaultValue={sp.availability ?? ""} className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-green-500 focus:outline-none">
                      <option value="">{ui.allStatus}</option>
                      <option value="AVAILABLE">{ui.available}</option>
                      <option value="BUSY">{ui.busy}</option>
                    </select>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      {locale === "ar" ? "الحد الأدنى للتقييم" : locale === "fr" ? "Note minimale" : "Min. rating"}
                    </label>
                    <div className="space-y-1.5">
                      {["", "4", "3"].map(val => (
                        <label key={val} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="minRating"
                            value={val}
                            defaultChecked={(sp.minRating ?? "") === val}
                            className="accent-green-700"
                          />
                          <span className="text-sm text-gray-700">
                            {val === "" ? ui.anyRating : (
                              <span className="flex items-center gap-1">
                                {val}★ {locale === "ar" ? "وأكثر" : locale === "fr" ? "et plus" : "+ above"}
                              </span>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-green-700 hover:bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                    {ui.filter}
                  </button>

                  {/* Reset */}
                  {(sp.cityId || sp.availability || sp.minRating || q) && (
                    <Link href="?" className="block text-center text-xs text-gray-400 hover:text-gray-600 transition-colors">
                      {locale === "ar" ? "إعادة تعيين المرشحات" : locale === "fr" ? "Réinitialiser les filtres" : "Reset filters"}
                    </Link>
                  )}
                </form>
              </div>
            </aside>

            {/* ── MAIN CONTENT ───────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              {/* Sort bar */}
              <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                <p className="text-sm text-gray-500">
                  {total > 0 ? (
                    <><span className="font-semibold text-gray-800">{total}</span> {ui.providers}</>
                  ) : null}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{ui.sortBy}:</span>
                  <div className="flex gap-1">
                    {[
                      { key: "rating",  label: ui.sortRating },
                      { key: "reviews", label: ui.sortReviews },
                      { key: "newest",  label: ui.sortNewest },
                    ].map(opt => (
                      <Link
                        key={opt.key}
                        href={filterHref({ sort: opt.key === "rating" ? undefined : opt.key, page: undefined })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          sort === opt.key || (opt.key === "rating" && !sp.sort)
                            ? "bg-green-700 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {opt.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Provider grid */}
              {providers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-4xl mb-4">
                    <Users className="h-10 w-10 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">{ui.noResults}</h3>
                  <p className="text-sm text-gray-400 max-w-xs">{ui.noResultsSub}</p>
                  {(sp.cityId || sp.availability || sp.minRating || q) && (
                    <Link href="?" className="mt-4 text-sm text-green-700 hover:underline">
                      {locale === "ar" ? "إزالة المرشحات" : locale === "fr" ? "Enlever les filtres" : "Remove filters"}
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {providers.map(provider => {
                    const cityName  = locale === "ar" ? provider.city.nameAr : locale === "fr" ? provider.city.nameFr : provider.city.name
                    const catLabel  = translations[`CAT_${provider.category.code}`] ?? provider.category.code
                    const portfolio = provider.portfolioImages.slice(0, 2)

                    return (
                      <div key={provider.id} className="bg-white border rounded-xl shadow-sm hover:shadow-md hover:border-green-200 transition-all group overflow-hidden flex flex-col">
                        {/* Portfolio strip or colored header */}
                        {portfolio.length > 0 ? (
                          <div className="flex h-28 overflow-hidden">
                            {portfolio.map(img => (
                              <div key={img.id} className="flex-1 overflow-hidden">
                                <img src={img.url} alt={img.caption ?? ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className={`h-16 bg-gradient-to-br ${style.gradient} opacity-20`} />
                        )}

                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex items-start gap-3 mb-3">
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-xl font-bold text-green-700 flex-shrink-0 overflow-hidden border-2 border-white shadow">
                              {provider.avatarUrl
                                ? <img src={provider.avatarUrl} alt={provider.businessName} className="w-full h-full object-cover" />
                                : provider.businessName?.[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="font-semibold text-gray-900 text-sm truncate">{provider.businessName}</h3>
                                {provider.isVerified && (
                                  <Shield className="h-3.5 w-3.5 text-green-600 flex-shrink-0" title={ui.verified} />
                                )}
                              </div>
                              <p className="text-xs text-gray-400 truncate">{catLabel}</p>
                            </div>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-2 mb-2">
                            <StarRating rating={provider.rating} />
                            <span className="text-xs text-gray-500">
                              {provider.rating > 0 ? provider.rating.toFixed(1) : "—"}
                              {" "}({provider.reviewCount} {ui.reviews})
                            </span>
                          </div>

                          {/* Meta */}
                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{cityName}
                            </span>
                            {provider.yearsExperience && (
                              <span>{provider.yearsExperience} {ui.experience}</span>
                            )}
                          </div>

                          <div className="flex items-center justify-between mb-3">
                            <AvailabilityBadge status={provider.availability} locale={locale} />
                          </div>

                          {/* Actions */}
                          <div className="mt-auto flex gap-2">
                            {provider.whatsapp && (
                              <a
                                href={`https://wa.me/${provider.whatsapp.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-medium py-2 rounded-lg transition-colors"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                                {ui.whatsapp}
                              </a>
                            )}
                            <Link
                              href={`/services/${provider.category.slug}/${provider.id}`}
                              className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 hover:border-green-300 hover:bg-green-50 text-gray-700 hover:text-green-700 text-xs font-medium py-2 rounded-lg transition-colors"
                            >
                              {ui.viewProfile}
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-1.5 mt-10">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pg = i + 1
                    return (
                      <Link
                        key={pg}
                        href={filterHref({ page: pg === 1 ? undefined : String(pg) })}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          pg === page
                            ? "bg-green-700 text-white shadow-sm"
                            : "bg-white border border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-700"
                        }`}
                      >
                        {pg}
                      </Link>
                    )
                  })}
                </div>
              )}

              {/* ── CTA for providers ─────────────────────────────────────── */}
              <div className={`mt-12 rounded-2xl bg-gradient-to-br ${style.gradient} text-white p-8 text-center`}>
                <div className="text-4xl mb-3">{style.icon}</div>
                <h3 className="text-xl font-bold mb-2">{ui.joinCta}</h3>
                <p className="text-white/80 mb-5 text-sm">{ui.joinSub}</p>
                <Link
                  href="/provider/register"
                  className="inline-flex items-center gap-2 bg-white text-green-800 hover:bg-green-50 font-semibold px-6 py-3 rounded-full transition-colors text-sm"
                >
                  <CheckCircle className="h-4 w-4" />
                  {ui.joinBtn}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
