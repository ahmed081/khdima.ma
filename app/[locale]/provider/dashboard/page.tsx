"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "@/i18n/navigation"
import { useTranslations, useLocale } from "next-intl"
import {
  Star, Eye, MessageCircle, Phone, Edit, Images,
  TrendingUp, Zap, CheckCircle, AlertCircle, MapPin,
  Briefcase, ChevronRight, BarChart2, Award, Clock,
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-600 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-bold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({
  icon, value, label, sublabel, color,
}: {
  icon: React.ReactNode
  value: string | number
  label: string
  sublabel?: string
  color: string
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm p-5 group hover:shadow-md transition-shadow`}>
      <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 ${color}`} />
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color} bg-opacity-10`}>
        {icon}
      </div>
      <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
      {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
    </div>
  )
}

// ─── Quick Action ─────────────────────────────────────────────────────────────
function QuickAction({
  href, icon, label, description, variant = "default",
}: {
  href: string
  icon: React.ReactNode
  label: string
  description: string
  variant?: "default" | "primary"
}) {
  return (
    <Link href={href} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5 group ${
      variant === "primary"
        ? "bg-gradient-to-br from-green-600 to-emerald-700 border-green-500 text-white shadow-lg shadow-green-600/20"
        : "bg-white border-gray-200 hover:border-green-200"
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
        variant === "primary" ? "bg-white/20" : "bg-gray-50"
      }`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`font-semibold text-sm ${variant === "primary" ? "text-white" : "text-gray-900"}`}>{label}</p>
        <p className={`text-xs truncate ${variant === "primary" ? "text-white/70" : "text-gray-400"}`}>{description}</p>
      </div>
      <ChevronRight className={`h-4 w-4 ms-auto flex-shrink-0 ${variant === "primary" ? "text-white/70" : "text-gray-300"}`} />
    </Link>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProviderDashboardPage() {
  const t      = useTranslations("provider")
  const td     = useTranslations("providerDashboard")
  const locale = useLocale()
  const qc     = useQueryClient()
  const isRTL  = locale === "ar"

  const { data, isLoading } = useQuery({
    queryKey: ["provider-dashboard"],
    queryFn: () => fetch("/api/provider/dashboard").then(r => r.json()),
  })

  const toggleAvailability = useMutation({
    mutationFn: async () => {
      const newAvail = data?.provider?.availability === "AVAILABLE" ? "BUSY" : "AVAILABLE"
      const res = await fetch("/api/provider/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: newAvail }),
      })
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["provider-dashboard"] }),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Skeleton hero */}
        <div className="h-52 bg-gradient-to-br from-slate-900 via-green-950 to-emerald-900 animate-pulse" />
        <div className="container mx-auto px-4 max-w-5xl -mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-gray-100" />
            ))}
          </div>
          <div className="h-52 bg-white rounded-2xl animate-pulse border border-gray-100 mb-6" />
        </div>
      </div>
    )
  }

  if (!data || data.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-600">{data?.error ?? td("errorLoading")}</p>
        </div>
      </div>
    )
  }

  const { provider, stats, contactStats, dailyContacts = [], recentReviews } = data
  const isAvailable = provider?.availability === "AVAILABLE"
  const isBusy      = provider?.availability === "BUSY"

  const availBadge =
    isAvailable ? { label: t("available"), color: "bg-green-500", text: "text-green-700", bg: "bg-green-50", border: "border-green-200" } :
    isBusy      ? { label: t("busy"),      color: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50",  border: "border-amber-200"  } :
                  { label: t("inactive"),   color: "bg-gray-400",  text: "text-gray-600",  bg: "bg-gray-50",   border: "border-gray-200"   }

  return (
    <main className="min-h-screen bg-slate-50 pb-16" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-slate-900 via-green-950 to-emerald-900 overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-emerald-400/10" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-white/[0.02]" />

        <div className="relative container mx-auto px-4 max-w-5xl py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 backdrop-blur border-2 border-white/20 overflow-hidden shadow-2xl">
                {provider?.avatarUrl
                  ? <img src={provider.avatarUrl} alt={provider.businessName} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-3xl font-extrabold text-white/80">
                      {provider?.businessName?.[0]?.toUpperCase() ?? "?"}
                    </div>
                }
              </div>
              <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-900 ${availBadge.color}`} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {provider?.businessName}
                </h1>
                {provider?.isVerified && (
                  <span className="flex items-center gap-1 text-xs font-semibold bg-white/15 border border-white/25 text-white px-2 py-0.5 rounded-full">
                    <CheckCircle className="h-3 w-3" />
                    {td("verifiedBadge")}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                {provider?.category?.code && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    {provider.category.code}
                  </span>
                )}
                {provider?.city?.name && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {locale === "ar" ? provider.city.nameAr : locale === "fr" ? provider.city.nameFr : provider.city.name}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
              <button
                onClick={() => toggleAvailability.mutate()}
                disabled={toggleAvailability.isPending}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${availBadge.bg} ${availBadge.border} ${availBadge.text} hover:shadow-md active:scale-95`}
              >
                <span className={`w-2 h-2 rounded-full ${availBadge.color}`} />
                {availBadge.label}
              </button>
              <Link
                href="/provider/dashboard/edit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-white text-green-700 shadow-lg hover:bg-green-50 transition-all active:scale-95"
              >
                <Edit className="h-4 w-4" />
                {t("editProfile")}
              </Link>
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="h-8 bg-slate-50" style={{ clipPath: "ellipse(100% 100% at 50% 100%)" }} />
      </div>

      <div className="container mx-auto px-4 max-w-5xl -mt-4">

        {/* ── PENDING BANNER ─────────────────────────────────────────────── */}
        {provider?.status === "PENDING" && (
          <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 text-sm">{t("pendingApproval")}</p>
              <p className="text-amber-600 text-xs mt-0.5">
                {td("pendingMessage")}
              </p>
            </div>
          </div>
        )}

        {/* ── STATS CARDS ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Eye className="h-5 w-5 text-blue-600" />}
            value={(stats?.profileViews ?? 0).toLocaleString()}
            label={t("profileViews")}
            color="bg-blue-500"
          />
          <StatCard
            icon={<Star className="h-5 w-5 text-amber-500 fill-amber-500" />}
            value={stats?.rating?.toFixed(1) ?? "—"}
            label={td("rating")}
            sublabel={`${stats?.reviewCount ?? 0} ${td("reviews")}`}
            color="bg-amber-500"
          />
          <StatCard
            icon={<MessageCircle className="h-5 w-5 text-green-600" />}
            value={contactStats?.whatsapp ?? 0}
            label="WhatsApp"
            sublabel={td("last30Days")}
            color="bg-green-500"
          />
          <StatCard
            icon={<Phone className="h-5 w-5 text-purple-600" />}
            value={contactStats?.call ?? 0}
            label={td("calls")}
            sublabel={td("last30Days")}
            color="bg-purple-500"
          />
        </div>

        {/* ── CHART + QUICK ACTIONS ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Contact trend chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-green-600" />
                  {td("contactActivity")}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {td("last7Days")}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  WhatsApp
                </span>
                <span className="flex items-center gap-1.5 text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  {td("calls")}
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={dailyContacts} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gradWhatsapp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradCall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone" dataKey="whatsapp" name="WhatsApp"
                  stroke="#22c55e" strokeWidth={2} fill="url(#gradWhatsapp)"
                />
                <Area
                  type="monotone" dataKey="call" name={td("calls")}
                  stroke="#3b82f6" strokeWidth={2} fill="url(#gradCall)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick actions */}
          <div className="space-y-3">
            <h2 className="font-bold text-gray-900 text-sm px-1">
              {td("quickActions")}
            </h2>
            <QuickAction
              href="/provider/dashboard/edit"
              icon={<Edit className="h-4 w-4 text-white" />}
              label={t("editProfile")}
              description={td("updateProfile")}
              variant="primary"
            />
            <QuickAction
              href="/provider/dashboard/edit"
              icon={<Images className="h-4 w-4 text-purple-600" />}
              label={td("portfolio")}
              description={td("managePhotos")}
            />
            <QuickAction
              href={`/services/${provider?.category?.slug}`}
              icon={<Eye className="h-4 w-4 text-blue-600" />}
              label={td("viewPublicProfile")}
              description={td("asSeenByClients")}
            />
          </div>
        </div>

        {/* ── RECENT REVIEWS ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              {t("reviews")}
            </h2>
            {recentReviews?.length > 0 && (
              <span className="text-xs text-gray-400">
                {td("last5Reviews")}
              </span>
            )}
          </div>

          {(!recentReviews || recentReviews.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-3">
                <Star className="h-8 w-8 text-amber-200" />
              </div>
              <p className="text-gray-400 text-sm">
                {td("noReviews")}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentReviews.map((rev: any) => (
                <div key={rev.id} className="px-6 py-4 flex gap-3 hover:bg-gray-50/50 transition-colors">
                  {/* Avatar letter */}
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-700 flex-shrink-0">
                    {rev.user?.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm text-gray-900">{rev.user?.name}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < rev.rating ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(rev.createdAt).toLocaleDateString(
                          locale === "ar" ? "ar-MA" : locale === "fr" ? "fr-MA" : "en-US",
                          { year: "numeric", month: "short", day: "numeric" }
                        )}
                      </span>
                    </div>
                    {rev.comment && (
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{rev.comment}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── FOOTER ROW ─────────────────────────────────────────────────── */}
        <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
          <Clock className="h-3.5 w-3.5" />
          <span>
            {td("memberSince")}:&nbsp;
            {provider?.createdAt
              ? new Date(provider.createdAt).toLocaleDateString(
                  locale === "ar" ? "ar-MA" : locale === "fr" ? "fr-MA" : "en-US",
                  { year: "numeric", month: "long" }
                )
              : "—"}
          </span>
          {provider?.status && (
            <>
              <span className="mx-1">·</span>
              <TrendingUp className="h-3.5 w-3.5" />
              <span className={`font-medium ${
                provider.status === "ACTIVE" ? "text-green-600" :
                provider.status === "PENDING" ? "text-amber-600" :
                "text-red-600"
              }`}>{provider.status}</span>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
