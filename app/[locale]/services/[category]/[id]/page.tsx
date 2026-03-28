export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import {
  Star, MapPin, Briefcase, Shield, CheckCircle,
  MessageCircle, Phone, Eye, ChevronRight, Calendar,
  Clock, Award, Camera, ThumbsUp, Pencil, ShieldAlert,
} from "lucide-react"
import { ReviewForm }    from "@/components/review-form"
import { ContactButtons } from "@/components/contact-buttons"
import { ReportButton }  from "@/components/report-button"
import { tMany }        from "@/lib/translations"
import type { Locale }  from "@/lib/translations"
import { Link }         from "@/i18n/navigation"
import { PublicLayout } from "@/components/public-layout"
import { getUserFromAuth } from "@/lib/auth"

interface Props {
  params: Promise<{ category: string; id: string }>
}

const CATEGORY_STYLES: Record<string, { gradient: string; lightBg: string; icon: string }> = {
  plumbing:    { gradient: "from-blue-600 via-blue-700 to-blue-900",     lightBg: "bg-blue-50",   icon: "🔧" },
  electricity: { gradient: "from-yellow-500 via-amber-600 to-amber-800", lightBg: "bg-amber-50",  icon: "⚡" },
  cleaning:    { gradient: "from-cyan-500 via-teal-600 to-teal-800",     lightBg: "bg-teal-50",   icon: "🧹" },
  "car-wash":  { gradient: "from-sky-500 via-sky-600 to-blue-800",       lightBg: "bg-sky-50",    icon: "🚗" },
  hvac:        { gradient: "from-indigo-500 via-indigo-600 to-blue-800", lightBg: "bg-indigo-50", icon: "❄️" },
  carpentry:   { gradient: "from-amber-600 via-orange-700 to-orange-900",lightBg: "bg-orange-50", icon: "🪵" },
  painting:    { gradient: "from-pink-500 via-rose-600 to-rose-800",     lightBg: "bg-rose-50",   icon: "🎨" },
  moving:      { gradient: "from-orange-500 via-orange-600 to-red-800",  lightBg: "bg-orange-50", icon: "📦" },
  gardening:   { gradient: "from-green-500 via-green-600 to-emerald-800",lightBg: "bg-green-50",  icon: "🌿" },
  security:    { gradient: "from-slate-600 via-slate-700 to-gray-900",   lightBg: "bg-slate-50",  icon: "🔒" },
  masonry:     { gradient: "from-stone-500 via-stone-600 to-stone-800",  lightBg: "bg-stone-50",  icon: "🏗️" },
  welding:     { gradient: "from-red-600 via-rose-700 to-rose-900",      lightBg: "bg-red-50",    icon: "⚙️" },
  aluminum:    { gradient: "from-zinc-500 via-zinc-600 to-slate-800",    lightBg: "bg-zinc-50",   icon: "🪟" },
}
const DEFAULT_STYLE = { gradient: "from-green-600 via-green-700 to-green-900", lightBg: "bg-green-50", icon: "🔨" }

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "h-5 w-5" : size === "md" ? "h-4 w-4" : "h-3.5 w-3.5"
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${sz} ${i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
      ))}
    </div>
  )
}

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-4 text-right text-gray-500 font-medium">{stars}</span>
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-7 text-right text-gray-400 text-xs">{count}</span>
    </div>
  )
}

export default async function ProviderProfilePage({ params }: Props) {
  const { id } = await params
  const locale  = await getLocale() as Locale
  const isRTL   = locale === "ar"

  const currentUser = await getUserFromAuth()

  const [provider, ratingGroups] = await Promise.all([
    prisma.provider.findUnique({
      where: { id: parseInt(id) },
      include: {
        user:     { select: { name: true, createdAt: true } },
        city:     true,
        category: true,
        subcategories: { include: { subcategory: true } },
        reviews: {
          where:   { isVisible: true },
          orderBy: { createdAt: "desc" },
          take:    10,
          include: { user: { select: { name: true } } },
        },
        portfolioImages: { orderBy: [{ order: "asc" }] },
      },
    }),
    prisma.review.groupBy({
      by:    ["rating"],
      where: { providerId: parseInt(id), isVisible: true },
      _count: { rating: true },
    }),
  ])

  if (!provider || (provider.status !== "ACTIVE" && currentUser?.role !== "ADMIN")) notFound()

  const isOwner = currentUser?.role === "PROVIDER" && currentUser.id === provider.userId
  const isAdmin = currentUser?.role === "ADMIN"

  // Fire-and-forget view increment
  prisma.provider.update({ where: { id: provider.id }, data: { profileViews: { increment: 1 } } }).catch(() => {})

  const catCode      = `CAT_${provider.category.code}`
  const subcatCodes  = provider.subcategories.map(ps => `SUBCAT_${ps.subcategory.code}`)
  const translations = await tMany([catCode, ...subcatCodes], locale)

  const cityName = locale === "ar" ? provider.city.nameAr : locale === "fr" ? provider.city.nameFr : provider.city.name
  const catName  = translations[catCode] ?? provider.category.code
  const bio      = locale === "ar" ? (provider.bioAr ?? provider.bio) : locale === "fr" ? (provider.bioFr ?? provider.bio) : provider.bio

  const style = CATEGORY_STYLES[provider.category.slug] ?? DEFAULT_STYLE

  const tp = await getTranslations("providerProfile")

  const availLabel =
    provider.availability === "AVAILABLE" ? tp("availableNow") :
    provider.availability === "BUSY"      ? tp("busy") :
                                            tp("inactive")

  const ratingMap = Object.fromEntries(ratingGroups.map(g => [g.rating, g._count.rating]))
  const totalReviews = provider.reviewCount

  const memberSince = provider.user.createdAt
    ? new Date(provider.user.createdAt).toLocaleDateString(
        locale === "ar" ? "ar-MA" : locale === "fr" ? "fr-MA" : "en-US",
        { year: "numeric", month: "long" }
      )
    : null


  return (
    <PublicLayout>
      <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 pb-24 md:pb-0">

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <div className={`relative bg-gradient-to-br ${style.gradient} text-white overflow-hidden`}>
          {/* decorative blobs */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.03] pointer-events-none" />

          {/* Breadcrumb */}
          <div className="relative px-6 pt-5">
            <nav className="flex items-center gap-1.5 text-white/60 text-xs flex-wrap">
              <Link href="/" className="hover:text-white transition-colors">
                {tp("home")}
              </Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/services" className="hover:text-white transition-colors">{tp("services")}</Link>
              <ChevronRight className="h-3 w-3" />
              <Link href={`/services/${provider.category.slug}`} className="hover:text-white transition-colors">{catName}</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white/90">{provider.businessName}</span>
            </nav>
          </div>

          {/* Provider hero info */}
          <div className="relative px-6 py-8 pb-16">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 overflow-hidden shadow-xl">
                  {provider.avatarUrl
                    ? <img src={provider.avatarUrl} alt={provider.businessName} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-white/80">{provider.businessName?.[0]}</div>
                  }
                </div>
                {/* availability dot */}
                <div className={`absolute -bottom-1 -right-1 flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border border-white/20 backdrop-blur-sm ${
                  provider.availability === "AVAILABLE" ? "bg-green-500 text-white" :
                  provider.availability === "BUSY"      ? "bg-amber-500 text-white" :
                                                          "bg-gray-500 text-white"
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  {availLabel}
                </div>
              </div>

              {/* Name + meta */}
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{provider.businessName}</h1>
                  {provider.isVerified && (
                    <span className="flex items-center gap-1 text-xs font-semibold bg-white/20 backdrop-blur-sm border border-white/30 px-2.5 py-1 rounded-full">
                      <Shield className="h-3.5 w-3.5" />
                      {tp("verified")}
                    </span>
                  )}
                </div>

                {/* Category */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{style.icon}</span>
                  <span className="text-white/90 font-medium">{catName}</span>
                </div>

                {/* Rating row */}
                <div className="flex items-center gap-2 mb-3">
                  <Stars rating={provider.rating} size="md" />
                  <span className="font-bold">{provider.rating > 0 ? provider.rating.toFixed(1) : "—"}</span>
                  <span className="text-white/70 text-sm">
                    ({totalReviews} {tp("reviewsLabel")})
                  </span>
                </div>

                {/* Location + experience */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-white/60" />{cityName}
                  </span>
                  {provider.yearsExperience && (
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-white/60" />
                      {provider.yearsExperience} {tp("experience")}
                    </span>
                  )}
                  {memberSince && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-white/60" />
                      {tp("memberSince")} {memberSince}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Owner / Admin badges */}
            {(isOwner || isAdmin) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {isOwner && (
                  <span className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1 text-xs font-semibold text-white">
                    <Shield className="h-3.5 w-3.5" />
                    {tp("myProfile")}
                  </span>
                )}
                {isAdmin && (
                  <span className="flex items-center gap-1.5 rounded-full bg-amber-500/30 backdrop-blur-sm border border-amber-400/40 px-3 py-1 text-xs font-semibold text-amber-200">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    {tp("adminView")}
                    {provider.status !== "ACTIVE" && (
                      <span className="ms-1 rounded-full bg-amber-500 px-2 py-0.5 text-white text-[10px]">
                        {provider.status === "PENDING" ? tp("pendingStatus") : tp("suspendedStatus")}
                      </span>
                    )}
                  </span>
                )}
              </div>
            )}

            {/* CTA buttons (desktop) */}
            <div className="hidden sm:flex gap-3 mt-6 flex-wrap">
              {provider.whatsapp && !isOwner && (
                <a
                  href={`https://wa.me/${provider.whatsapp.replace(/\D/g, "")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-black/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp
                </a>
              )}
              {provider.phone && !isOwner && (
                <a
                  href={`tel:${provider.phone}`}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5"
                >
                  <Phone className="h-5 w-5" />
                  {tp("call")}
                </a>
              )}
              {isOwner && (
                <Link
                  href="/provider/dashboard/edit"
                  className="flex items-center gap-2 bg-white text-green-700 hover:bg-green-50 font-semibold px-6 py-3 rounded-xl shadow-lg transition-all hover:-translate-y-0.5"
                >
                  <Pencil className="h-5 w-5" />
                  {tp("editProfile")}
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 backdrop-blur-sm border border-amber-400/40 text-amber-200 font-semibold px-5 py-3 rounded-xl transition-all"
                >
                  <ShieldAlert className="h-5 w-5" />
                  {tp("goToAdmin")}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── STATS BAR ─────────────────────────────────────────────── */}
        <div className="bg-white border-b shadow-sm -mt-2">
          <div className="max-w-4xl mx-auto px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                icon: <Star className="h-5 w-5 text-amber-400 fill-amber-400" />,
                value: provider.rating > 0 ? `${provider.rating.toFixed(1)} ${tp("ratingOf")}` : "—",
                label: tp("statsRating"),
              },
              {
                icon: <ThumbsUp className="h-5 w-5 text-green-600" />,
                value: String(totalReviews),
                label: tp("reviewsLabel"),
              },
              {
                icon: <Eye className="h-5 w-5 text-blue-500" />,
                value: String(provider.profileViews ?? 0),
                label: tp("views"),
              },
              {
                icon: <Award className="h-5 w-5 text-purple-500" />,
                value: provider.yearsExperience ? `${provider.yearsExperience}` : "—",
                label: tp("yrsExp"),
              },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                  {stat.icon}
                </div>
                <div>
                  <div className="font-bold text-gray-900 leading-tight">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── BODY ──────────────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

          {/* About */}
          {bio && (
            <section className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50/80">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-green-600 inline-block" />
                  {tp("about")}
                </h2>
              </div>
              <div className="px-6 py-5">
                <p className="text-gray-600 leading-relaxed">{bio}</p>
              </div>
            </section>
          )}

          {/* Specialties / subcategories */}
          {provider.subcategories.length > 0 && (
            <section className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50/80">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-green-600 inline-block" />
                  {tp("specialties")}
                </h2>
              </div>
              <div className="px-6 py-5">
                <div className="flex flex-wrap gap-2">
                  {provider.subcategories.map(ps => (
                    <span
                      key={ps.subcategoryId}
                      className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full ${style.lightBg} text-gray-700 border border-gray-200`}
                    >
                      <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                      {translations[`SUBCAT_${ps.subcategory.code}`] ?? ps.subcategory.code}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Portfolio */}
          {provider.portfolioImages.length > 0 && (
            <section className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50/80 flex items-center justify-between">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-green-600 inline-block" />
                  {tp("portfolio")}
                </h2>
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Camera className="h-3.5 w-3.5" />
                  {provider.portfolioImages.length}
                </span>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {provider.portfolioImages.map(img => (
                    <div key={img.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative group shadow-sm">
                      <img
                        src={img.url}
                        alt={img.caption ?? ""}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      {img.caption && (
                        <div className="absolute inset-x-0 bottom-0 p-2.5 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity truncate">
                          {img.caption}
                        </div>
                      )}
                      {img.isBefore && (
                        <span className="absolute top-2 start-2 bg-gray-900/80 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full font-medium">
                          {tp("before")}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Reviews */}
          <section className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50/80">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-green-600 inline-block" />
                {tp("customerReviews")}
                {totalReviews > 0 && (
                  <span className="text-xs font-normal text-gray-400 ms-1">({totalReviews})</span>
                )}
              </h2>
            </div>

            {totalReviews > 0 && (
              <div className="px-6 py-5 border-b bg-gray-50/40">
                <div className="flex items-center gap-6 flex-wrap">
                  {/* Big rating */}
                  <div className="text-center">
                    <div className="text-5xl font-extrabold text-gray-900 leading-none mb-1">
                      {provider.rating.toFixed(1)}
                    </div>
                    <Stars rating={provider.rating} size="md" />
                    <div className="text-xs text-gray-400 mt-1">
                      {totalReviews} {tp("reviewsLabel")}
                    </div>
                  </div>
                  {/* Distribution bars */}
                  <div className="flex-1 min-w-40 space-y-1.5">
                    {[5, 4, 3, 2, 1].map(s => (
                      <RatingBar key={s} stars={s} count={ratingMap[s] ?? 0} total={totalReviews} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="px-6 py-5">
              {provider.reviews.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Star className="h-7 w-7 text-gray-300" />
                  </div>
                  <p className="text-gray-500 text-sm">{tp("noReviews")}</p>
                </div>
              ) : (
                <div className="space-y-5 mb-8">
                  {provider.reviews.map(review => (
                    <div key={review.id} className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-700 flex-shrink-0">
                        {review.user.name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-sm text-gray-900">{review.user.name}</span>
                          <Stars rating={review.rating} size="sm" />
                          <span className="text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString(
                              locale === "ar" ? "ar-MA" : locale === "fr" ? "fr-MA" : "en-US",
                              { year: "numeric", month: "short", day: "numeric" }
                            )}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl px-3 py-2.5">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Leave review form */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">{tp("leaveReview")}</h3>
                <ReviewForm providerId={provider.id} />
              </div>
            </div>
          </section>

          {/* Admin notes section */}
          {isAdmin && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-amber-200 bg-amber-100/60 flex items-center justify-between">
                <h2 className="font-bold text-amber-800 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  {tp("adminNote")}
                </h2>
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-200 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {tp("goToAdmin")}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="px-6 py-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-amber-700">
                  <span className="font-medium">{tp("status")}:</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    provider.status === "ACTIVE"    ? "bg-green-100 text-green-700" :
                    provider.status === "PENDING"   ? "bg-amber-100 text-amber-700" :
                                                      "bg-red-100 text-red-700"
                  }`}>
                    {provider.status}
                  </span>
                </div>
                {provider.adminNotes && (
                  <p className="text-amber-800 bg-amber-100 rounded-xl px-4 py-3 leading-relaxed">
                    {provider.adminNotes}
                  </p>
                )}
                {!provider.adminNotes && (
                  <p className="text-amber-500 italic text-xs">{tp("noAdminNotes")}</p>
                )}
              </div>
            </section>
          )}

          {/* Report + Back link row */}
          <div className="flex items-center justify-between text-sm text-gray-400 pt-2">
            <Link
              href={`/services/${provider.category.slug}`}
              className="flex items-center gap-1.5 hover:text-green-700 transition-colors"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              {tp("backTo", { catName })}
            </Link>
            <ReportButton providerId={provider.id} />
          </div>
        </div>

        {/* ── STICKY MOBILE CTA ─────────────────────────────────────── */}
        <div className="fixed bottom-0 inset-x-0 sm:hidden bg-white border-t shadow-2xl px-4 py-3 z-50">
          <div className="flex gap-2">
            {isOwner ? (
              <Link
                href="/provider/dashboard/edit"
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                <Pencil className="h-4 w-4" />
                {t.editProfile}
              </Link>
            ) : (
              <>
                {provider.whatsapp && (
                  <a
                    href={`https://wa.me/${provider.whatsapp.replace(/\D/g, "")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                )}
                {provider.phone && (
                  <a
                    href={`tel:${provider.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-green-300 text-gray-700 hover:text-green-700 font-semibold py-3 rounded-xl text-sm transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    {tp("call")}
                  </a>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </PublicLayout>
  )
}
