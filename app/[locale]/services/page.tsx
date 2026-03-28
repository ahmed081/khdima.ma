import { Link } from "@/i18n/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { getCategoriesWithTranslations } from "@/lib/translations"
import { prisma } from "@/lib/prisma"
import { Search, ArrowRight, Wrench } from "lucide-react"

const CATEGORY_STYLES: Record<string, { gradient: string; bg: string; icon: string }> = {
  plumbing:    { gradient: "from-blue-600 to-blue-800",     bg: "bg-blue-50 border-blue-100",    icon: "🔧" },
  electricity: { gradient: "from-yellow-500 to-amber-600",  bg: "bg-yellow-50 border-yellow-100", icon: "⚡" },
  cleaning:    { gradient: "from-cyan-500 to-teal-700",     bg: "bg-cyan-50 border-cyan-100",     icon: "🧹" },
  "car-wash":  { gradient: "from-sky-500 to-blue-700",      bg: "bg-sky-50 border-sky-100",       icon: "🚗" },
  hvac:        { gradient: "from-indigo-500 to-blue-700",   bg: "bg-indigo-50 border-indigo-100", icon: "❄️" },
  carpentry:   { gradient: "from-amber-600 to-orange-700",  bg: "bg-amber-50 border-amber-100",   icon: "🪵" },
  painting:    { gradient: "from-pink-500 to-rose-700",     bg: "bg-pink-50 border-pink-100",     icon: "🎨" },
  moving:      { gradient: "from-orange-500 to-red-700",    bg: "bg-orange-50 border-orange-100", icon: "📦" },
  gardening:   { gradient: "from-green-500 to-emerald-700", bg: "bg-green-50 border-green-100",   icon: "🌿" },
  security:    { gradient: "from-slate-600 to-gray-800",    bg: "bg-slate-50 border-slate-100",   icon: "🔒" },
  masonry:     { gradient: "from-stone-500 to-stone-700",   bg: "bg-stone-50 border-stone-100",   icon: "🏗️" },
  welding:     { gradient: "from-red-600 to-rose-800",      bg: "bg-red-50 border-red-100",       icon: "⚙️" },
  aluminum:    { gradient: "from-zinc-500 to-slate-700",    bg: "bg-zinc-50 border-zinc-100",     icon: "🪟" },
}

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function ServicesPage({ searchParams }: Props) {
  const [locale, t, sp] = await Promise.all([getLocale(), getTranslations("home"), searchParams])
  const q = sp.q?.trim() ?? ""

  // Fetch categories + provider counts in parallel
  const [categories, providerCounts] = await Promise.all([
    getCategoriesWithTranslations(locale as "fr" | "en" | "ar"),
    prisma.provider.groupBy({
      by: ["categoryId"],
      where: { status: "ACTIVE" },
      _count: { categoryId: true },
    }),
  ])

  const countMap: Record<number, number> = {}
  providerCounts.forEach(p => { countMap[p.categoryId] = p._count.categoryId })

  const totalProviders = Object.values(countMap).reduce((a, b) => a + b, 0)

  // Filter by search query
  const filtered = q
    ? categories.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || c.slug.includes(q.toLowerCase()))
    : categories

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="relative bg-gradient-to-br from-green-700 via-emerald-700 to-teal-700 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-white/10" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-white/10" />
        </div>

        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-semibold mb-6">
            <Wrench className="h-4 w-4" />
            {t("allServices")}
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3">
            {t("servicesHeroTitle")}
          </h1>
          <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
            {t("servicesHeroSub", { totalProviders, count: categories.length })}
          </p>

          {/* Search bar */}
          <form method="get" className="max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-gray-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder={t("servicesSearchPlaceholder")}
                className="w-full h-14 pl-12 pr-32 rounded-2xl bg-white text-gray-800 text-base shadow-xl focus:outline-none focus:ring-2 focus:ring-green-400 placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="absolute right-2 flex items-center gap-2 h-10 px-5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-sm transition-colors"
              >
                {t("search")}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Search result note */}
        {q && (
          <div className="mb-6 flex items-center gap-3">
            <p className="text-gray-600">
              {t("searchResults", { q, count: filtered.length })}
            </p>
            <Link href="/services" className="text-sm text-green-700 hover:underline font-medium">
              {t("clearSearch")}
            </Link>
          </div>
        )}

        {/* Section title */}
        {!q && (
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900">
              {t("browseByCategory")}
            </h2>
            <p className="text-gray-500 mt-1">{t("categoriesSubtitle")}</p>
          </div>
        )}

        {/* Categories grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">
              {t("noServicesFound")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {filtered.map(cat => {
              const style = CATEGORY_STYLES[cat.slug] ?? { gradient: "from-green-600 to-emerald-700", bg: "bg-green-50 border-green-100", icon: "🔨" }
              const count = countMap[cat.id] ?? 0
              const href = q ? `/services/${cat.slug}?q=${encodeURIComponent(q)}` : `/services/${cat.slug}`

              return (
                <Link key={cat.id} href={href as any} className="group">
                  <div className="relative rounded-2xl border bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                    {/* Top colored banner */}
                    <div className={`relative h-24 bg-gradient-to-br ${style.gradient} flex items-center justify-center overflow-hidden`}>
                      {/* Background circles */}
                      <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-white/10" />
                      <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/10" />
                      <span className="relative text-4xl">{cat.icon ?? style.icon}</span>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-green-700 transition-colors">
                          {cat.name}
                        </h3>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          count > 0 ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-400 border-gray-200"
                        }`}>
                          {count > 0 ? t("proCount", { count }) : t("comingSoon")}
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-green-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* CTA banner */}
        <div className="mt-16 rounded-3xl bg-gradient-to-br from-green-700 to-emerald-700 p-8 text-center text-white overflow-hidden relative">
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="relative">
            <h3 className="text-2xl font-extrabold mb-2">
              {t("becomeProvider")}
            </h3>
            <p className="text-green-100 mb-6 max-w-md mx-auto">
              {t("joinProsText")}
            </p>
            <Link
              href="/provider/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-green-700 font-bold hover:bg-green-50 transition-colors shadow-lg"
            >
              <Wrench className="h-5 w-5" />
              {t("becomeProviderCta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
