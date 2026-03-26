"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "@/i18n/navigation"
import {
  ArrowLeft, Search, Eye, CheckCircle, Ban, Clock,
  Phone, MessageCircle, Star, X, Shield, MapPin,
  Briefcase, Users, TrendingUp, Camera, BarChart2,
  Loader2, BadgeCheck, AlertCircle, Calendar,
} from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface Provider {
  id: number
  businessName: string
  status: string
  isVerified: boolean
  profileViews: number
  availability: string
  createdAt: string
  avatarUrl: string | null
  user: { name: string; email: string }
  city: { name: string }
  category: { code: string; slug: string }
  _count: { contactLogs: number; portfolioImages: number; reviews: number }
}

interface ProviderDetail extends Provider {
  phone: string
  whatsapp: string | null
  website: string | null
  bio: string | null
  yearsExperience: number | null
  contactBreakdown: Record<string, number>
  trendData: { date: string; count: number }[]
  recentReviews: { rating: number; comment: string | null; createdAt: string }[]
  user: { name: string; email: string; createdAt: string }
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:    "bg-green-100 text-green-700 border-green-200",
  PENDING:   "bg-amber-100 text-amber-700 border-amber-200",
  SUSPENDED: "bg-red-100   text-red-700   border-red-200",
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  )
}

function ProviderDetailModal({ providerId, onClose }: { providerId: number; onClose: () => void }) {
  const qc = useQueryClient()

  const { data: provider, isLoading } = useQuery<ProviderDetail>({
    queryKey: ["admin-provider-detail", providerId],
    queryFn: () => fetch(`/api/admin/providers/${providerId}`).then(r => r.json()),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ status, isVerified }: { status?: string; isVerified?: boolean }) => {
      const res = await fetch("/api/admin/providers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: providerId, status, isVerified }),
      })
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-providers"] })
      qc.invalidateQueries({ queryKey: ["admin-provider-detail", providerId] })
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="font-bold text-lg text-gray-900">Provider Details</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : !provider || (provider as any).error ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <AlertCircle className="h-6 w-6 me-2" /> Failed to load
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Profile header */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {provider.avatarUrl ? (
                  <img src={provider.avatarUrl} alt={provider.businessName} className="h-20 w-20 rounded-2xl object-cover border border-gray-200" />
                ) : (
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-3xl font-extrabold">
                    {provider.businessName?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-xl font-extrabold text-gray-900 truncate">{provider.businessName}</h3>
                  <StatusBadge status={provider.status} />
                  {provider.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                      <BadgeCheck className="h-3 w-3" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{provider.user.name} · {provider.user.email}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{provider.city.name}</span>
                  <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{provider.category.slug}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Joined {new Date(provider.user.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {provider.status !== "ACTIVE" && (
                <button
                  onClick={() => updateMutation.mutate({ status: "ACTIVE" })}
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition disabled:opacity-60"
                >
                  <CheckCircle className="h-4 w-4" /> Approve
                </button>
              )}
              {provider.status !== "SUSPENDED" && (
                <button
                  onClick={() => updateMutation.mutate({ status: "SUSPENDED" })}
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition disabled:opacity-60"
                >
                  <Ban className="h-4 w-4" /> Suspend
                </button>
              )}
              {provider.status !== "PENDING" && (
                <button
                  onClick={() => updateMutation.mutate({ status: "PENDING" })}
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold transition disabled:opacity-60"
                >
                  <Clock className="h-4 w-4" /> Set Pending
                </button>
              )}
              <button
                onClick={() => updateMutation.mutate({ isVerified: !provider.isVerified })}
                disabled={updateMutation.isPending}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-60 ${
                  provider.isVerified
                    ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                }`}
              >
                <Shield className="h-4 w-4" />
                {provider.isVerified ? "Remove Verification" : "Verify"}
              </button>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Eye,           label: "Profile Views",  value: provider.profileViews,              color: "text-blue-600",   bg: "bg-blue-50" },
                { icon: Phone,         label: "Calls",          value: provider.contactBreakdown?.CALL ?? 0,      color: "text-green-600",  bg: "bg-green-50" },
                { icon: MessageCircle, label: "WhatsApp",       value: provider.contactBreakdown?.WHATSAPP ?? 0,  color: "text-emerald-600",bg: "bg-emerald-50" },
                { icon: Star,          label: "Reviews",        value: provider._count?.reviews ?? 0,       color: "text-amber-600",  bg: "bg-amber-50" },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className={`rounded-xl border border-gray-100 p-4 ${bg}`}>
                  <Icon className={`h-5 w-5 mb-2 ${color}`} />
                  <p className="text-2xl font-extrabold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* 30-day trend chart */}
            {provider.trendData && provider.trendData.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-5">
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Contact Activity — Last 30 Days
                </h4>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={provider.trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip formatter={(v: any) => [v, "Contacts"]} labelFormatter={l => `Date: ${l}`} />
                    <Area type="monotone" dataKey="count" stroke="#16a34a" strokeWidth={2} fill="url(#trendGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Contact info */}
            {(provider.phone || provider.whatsapp) && (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Contact Info</h4>
                {provider.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a href={`tel:${provider.phone}`} className="hover:text-green-700">{provider.phone}</a>
                  </div>
                )}
                {provider.whatsapp && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MessageCircle className="h-4 w-4 text-green-500" />
                    <span>{provider.whatsapp}</span>
                  </div>
                )}
              </div>
            )}

            {/* Bio */}
            {provider.bio && (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Bio</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{provider.bio}</p>
              </div>
            )}

            {/* Recent reviews */}
            {provider.recentReviews && provider.recentReviews.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-5">
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  Recent Reviews
                </h4>
                <div className="space-y-3">
                  {provider.recentReviews.map((r, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-1 mb-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className={`h-3.5 w-3.5 ${j < r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                        ))}
                        <span className="text-xs text-gray-400 ms-2">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      {r.comment && <p className="text-xs text-gray-600">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex items-center gap-3">
                <Camera className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-lg font-extrabold text-gray-900">{provider._count?.portfolioImages ?? 0}</p>
                  <p className="text-xs text-gray-500">Portfolio Photos</p>
                </div>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex items-center gap-3">
                <BarChart2 className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-lg font-extrabold text-gray-900">{provider._count?.contactLogs ?? 0}</p>
                  <p className="text-xs text-gray-500">Total Contacts</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminProvidersPage() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState("")
  const [search, setSearch]             = useState("")
  const [selectedId, setSelectedId]     = useState<number | null>(null)

  const { data: providers = [], isLoading } = useQuery<Provider[]>({
    queryKey: ["admin-providers", statusFilter],
    queryFn: () =>
      fetch(`/api/admin/providers${statusFilter ? `?status=${statusFilter}` : ""}`)
        .then(r => r.json()),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, isVerified }: { id: number; status?: string; isVerified?: boolean }) => {
      const res = await fetch("/api/admin/providers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, isVerified }),
      })
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-providers"] }),
  })

  const filtered = providers.filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      p.businessName.toLowerCase().includes(q) ||
      p.user.name.toLowerCase().includes(q) ||
      p.user.email.toLowerCase().includes(q)
    )
  })

  const counts = {
    all:       providers.length,
    PENDING:   providers.filter(p => p.status === "PENDING").length,
    ACTIVE:    providers.filter(p => p.status === "ACTIVE").length,
    SUSPENDED: providers.filter(p => p.status === "SUSPENDED").length,
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {selectedId && (
        <ProviderDetailModal providerId={selectedId} onClose={() => setSelectedId(null)} />
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-5">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-1">
            <Link href="/admin" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-medium text-gray-700">Providers</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Manage Providers</h1>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",     value: counts.all,       icon: Users,        color: "text-blue-600",  bg: "bg-blue-50",  border: "border-blue-100" },
            { label: "Pending",   value: counts.PENDING,   icon: Clock,        color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
            { label: "Active",    value: counts.ACTIVE,    icon: CheckCircle,  color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
            { label: "Suspended", value: counts.SUSPENDED, icon: Ban,          color: "text-red-600",   bg: "bg-red-50",   border: "border-red-100" },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <button
              key={label}
              onClick={() => setStatusFilter(label === "Total" ? "" : label.toUpperCase())}
              className={`rounded-2xl border p-4 text-start transition-all hover:shadow-md ${bg} ${border}`}
            >
              <Icon className={`h-5 w-5 mb-2 ${color}`} />
              <p className="text-2xl font-extrabold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>

          {/* Status tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {["", "PENDING", "ACTIVE", "SUSPENDED"].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === s
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {s || "All"}
              </button>
            ))}
          </div>
        </div>

        {/* Providers list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No providers found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(provider => (
              <div
                key={provider.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow"
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {provider.avatarUrl ? (
                    <img src={provider.avatarUrl} alt={provider.businessName} className="h-12 w-12 rounded-xl object-cover border border-gray-100" />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-extrabold text-lg">
                      {provider.businessName?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className="font-semibold text-gray-900 truncate">{provider.businessName}</span>
                    <StatusBadge status={provider.status} />
                    {provider.isVerified && (
                      <span className="flex items-center gap-0.5 text-xs text-blue-600 font-semibold">
                        <BadgeCheck className="h-3.5 w-3.5" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{provider.user.name} · {provider.user.email}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{provider.city.name}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{provider.profileViews} views</span>
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{provider._count.contactLogs} contacts</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setSelectedId(provider.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>

                  {provider.status === "PENDING" && (
                    <button
                      onClick={() => updateMutation.mutate({ id: provider.id, status: "ACTIVE" })}
                      disabled={updateMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors disabled:opacity-60"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </button>
                  )}

                  {provider.status === "ACTIVE" && (
                    <button
                      onClick={() => updateMutation.mutate({ id: provider.id, status: "SUSPENDED" })}
                      disabled={updateMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium transition-colors disabled:opacity-60"
                    >
                      <Ban className="h-4 w-4" />
                      Suspend
                    </button>
                  )}

                  {provider.status === "SUSPENDED" && (
                    <button
                      onClick={() => updateMutation.mutate({ id: provider.id, status: "ACTIVE" })}
                      disabled={updateMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium transition-colors disabled:opacity-60"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Restore
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
