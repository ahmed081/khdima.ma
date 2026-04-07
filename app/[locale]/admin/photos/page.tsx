"use client"

import { useState, useMemo } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { Link } from "@/i18n/navigation"
import {
  ArrowLeft, Camera, User, Search, CheckCircle2,
  ImageIcon, ChevronRight,
} from "lucide-react"

interface ProviderRow {
  id: number
  businessName: string
  avatarUrl: string | null
  pendingAvatarUrl: string | null
  categoryCode: string | null
  user: { name: string; email: string; createdAt: string }
  pendingProfilePhotos: number
  pendingPortfolioPhotos: number
}

type FilterTab = "all" | "profile" | "portfolio"

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ")
  const letters = parts.length >= 2
    ? parts[0][0] + parts[1][0]
    : name.slice(0, 2)
  return (
    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 uppercase select-none">
      {letters}
    </div>
  )
}

export default function AdminPhotosPage() {
  const t      = useTranslations("admin")
  const router = useRouter()
  const qc     = useQueryClient()

  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterTab>("all")

  const { data: providers = [], isLoading } = useQuery<ProviderRow[]>({
    queryKey: ["admin-photos-grouped"],
    queryFn: () => fetch("/api/admin/photos?grouped=true").then(r => r.json()),
    refetchOnWindowFocus: true,
  })

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return providers.filter(p => {
      const matchSearch =
        !q ||
        p.businessName.toLowerCase().includes(q) ||
        p.user.name.toLowerCase().includes(q) ||
        p.user.email.toLowerCase().includes(q)

      const matchFilter =
        filter === "all" ||
        (filter === "profile"   && p.pendingProfilePhotos > 0) ||
        (filter === "portfolio" && p.pendingPortfolioPhotos > 0)

      return matchSearch && matchFilter
    })
  }, [providers, search, filter])

  const FILTER_TABS: { key: FilterTab; label: string }[] = [
    { key: "all",       label: t("photosFilterAll") },
    { key: "profile",   label: t("photosFilterProfile") },
    { key: "portfolio", label: t("photosFilterPortfolio") },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
            <Camera className="h-4 w-4 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 leading-none">{t("photosListTitle")}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{t("photosListDesc")}</p>
          </div>
          {!isLoading && providers.length > 0 && (
            <div className="flex-shrink-0 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              {providers.length} profiles
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* ── Search + Filters ────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t("photosSearchPlaceholder")}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
            />
          </div>

          <div className="flex gap-1.5 bg-white border border-gray-200 rounded-xl p-1">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === tab.key
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-32" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">{t("photosNoPendingProfiles")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(p => {
              const total = p.pendingProfilePhotos + p.pendingPortfolioPhotos
              return (
                /* ── Card: click anywhere → provider admin profile ── */
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/admin/providers` as any)}
                  onKeyDown={e => e.key === "Enter" && router.push(`/admin/providers` as any)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 cursor-pointer hover:shadow-md hover:border-purple-200 hover:-translate-y-0.5 transition-all group select-none"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {p.avatarUrl ? (
                      <img
                        src={p.avatarUrl}
                        alt={p.businessName}
                        className="w-11 h-11 rounded-full object-cover"
                      />
                    ) : (
                      <Initials name={p.businessName} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate leading-snug">
                          {p.businessName}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{p.user.email}</p>
                      </div>
                      {/* Total badge */}
                      <span className="flex-shrink-0 bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full ring-1 ring-amber-200">
                        {t("photosTotalPending", { count: total })}
                      </span>
                    </div>

                    {/* Category + per-type badges */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {p.categoryCode && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
                          {p.categoryCode}
                        </span>
                      )}
                      {/* Profile badge — only show when > 0 */}
                      {p.pendingProfilePhotos > 0 ? (
                        <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold ring-1 ring-blue-100">
                          <User className="h-3 w-3" />
                          {t("photosPendingProfile", { count: p.pendingProfilePhotos })}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs bg-gray-50 text-gray-300 px-2 py-0.5 rounded-full font-medium ring-1 ring-gray-100">
                          <User className="h-3 w-3" />
                          {t("photosPendingProfile", { count: 0 })}
                        </span>
                      )}
                      {/* Portfolio badge — only show when > 0 */}
                      {p.pendingPortfolioPhotos > 0 ? (
                        <span className="flex items-center gap-1 text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-semibold ring-1 ring-purple-100">
                          <ImageIcon className="h-3 w-3" />
                          {t("photosPendingPortfolio", { count: p.pendingPortfolioPhotos })}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs bg-gray-50 text-gray-300 px-2 py-0.5 rounded-full font-medium ring-1 ring-gray-100">
                          <ImageIcon className="h-3 w-3" />
                          {t("photosPendingPortfolio", { count: 0 })}
                        </span>
                      )}
                    </div>

                    {/* Review CTA — stopPropagation so card click doesn't fire */}
                    <div className="mt-3">
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          router.push(`/admin/photos/${p.id}` as any)
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-2 py-1 rounded-lg transition-colors"
                      >
                        {t("photosReviewBtn")}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
