"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import {
  ArrowLeft, Plus, Search, MapPin, Users, Briefcase,
  Pencil, Power, PowerOff, X, Loader2, Check, ChevronUp, ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface City {
  id: number
  code: string
  name: string
  nameAr: string
  nameFr: string
  isActive: boolean
  order: number
  _count: { users: number; providers: number }
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function CityModal({
  city,
  onClose,
}: {
  city?: City
  onClose: () => void
}) {
  const t = useTranslations("admin")
  const qc = useQueryClient()
  const isEdit = !!city

  const [form, setForm] = useState({
    code:   city?.code   ?? "",
    name:   city?.name   ?? "",
    nameAr: city?.nameAr ?? "",
    nameFr: city?.nameFr ?? "",
    order:  String(city?.order ?? 99),
  })
  const [error, setError] = useState("")

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const mutation = useMutation({
    mutationFn: async () => {
      const url    = isEdit ? `/api/admin/cities/${city!.id}` : "/api/admin/cities"
      const method = isEdit ? "PATCH" : "POST"
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, order: Number(form.order) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error")
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-cities"] })
      onClose()
    },
    onError: (err: any) => setError(err.message),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            <h2 className="font-bold text-gray-900">
              {isEdit ? t("editCity") : t("addCity")}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={e => { e.preventDefault(); setError(""); mutation.mutate() }}
          className="p-6 space-y-4"
        >
          {!isEdit && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">{t("fieldCode")} *</Label>
              <Input
                value={form.code}
                onChange={e => set("code", e.target.value.toUpperCase())}
                required
                placeholder="CASA"
                className="h-10 uppercase"
              />
              <p className="text-xs text-gray-400">{t("codeHintCity")}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">{t("fieldNameEn")} *</Label>
              <Input value={form.name}   onChange={e => set("name",   e.target.value)} required placeholder="Casablanca" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">{t("fieldNameFr")} *</Label>
              <Input value={form.nameFr} onChange={e => set("nameFr", e.target.value)} required placeholder="Casablanca" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">{t("fieldNameAr")} *</Label>
              <Input value={form.nameAr} onChange={e => set("nameAr", e.target.value)} required placeholder="الدار البيضاء" className="h-10" dir="rtl" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">{t("fieldOrder")}</Label>
            <Input
              type="number"
              min="0"
              value={form.order}
              onChange={e => set("order", e.target.value)}
              className="h-10 w-28"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>{t("cancelBtn")}</Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-green-600 hover:bg-green-500 text-white"
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {isEdit ? t("saveChangesBtn") : t("addCity")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminCitiesPage() {
  const t = useTranslations("admin")
  const qc = useQueryClient()
  const [search, setSearch]     = useState("")
  const [editCity, setEditCity] = useState<City | null>(null)
  const [adding, setAdding]     = useState(false)
  const [showInactive, setShowInactive] = useState(false)

  const { data: cities = [], isLoading } = useQuery<City[]>({
    queryKey: ["admin-cities"],
    queryFn: () => fetch("/api/admin/cities").then(r => r.json()),
  })

  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await fetch(`/api/admin/cities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error")
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-cities"] }),
  })

  const reorder = useMutation({
    mutationFn: async ({ id, order }: { id: number; order: number }) => {
      const res = await fetch(`/api/admin/cities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error")
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-cities"] }),
  })

  const filtered = cities.filter(c => {
    if (!showInactive && !c.isActive) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.nameAr.includes(q) ||
      c.nameFr.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
    )
  })

  const sorted = [...filtered].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))

  const totalUsers     = cities.reduce((s, c) => s + c._count.users, 0)
  const totalProviders = cities.reduce((s, c) => s + c._count.providers, 0)
  const activeCities   = cities.filter(c => c.isActive).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <h1 className="text-xl font-bold text-gray-900">{t("cityMgmt")}</h1>
            </div>
          </div>
          <Button
            onClick={() => setAdding(true)}
            className="bg-green-600 hover:bg-green-500 text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("addCity")}
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: t("activeCities"),       value: activeCities,   icon: MapPin,    color: "text-green-600 bg-green-50" },
            { label: t("totalUsersLabel"),    value: totalUsers,     icon: Users,     color: "text-blue-600  bg-blue-50" },
            { label: t("totalProvidersLabel"), value: totalProviders, icon: Briefcase, color: "text-purple-600 bg-purple-50" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t("searchCities")}
              className="ps-9 h-9"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={e => setShowInactive(e.target.checked)}
              className="rounded"
            />
            {t("showInactive")}
          </label>
          <span className="text-xs text-gray-400 ms-auto">{t("citiesCount", { count: sorted.length })}</span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <MapPin className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm">{t("noCitiesFound")}</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-start px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-12">{t("colOrder")}</th>
                  <th className="text-start px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("colCity")}</th>
                  <th className="text-start px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">{t("colArabic")}</th>
                  <th className="text-start px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">{t("colCode")}</th>
                  <th className="text-start px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("colUsers")}</th>
                  <th className="text-start px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("providers")}</th>
                  <th className="text-start px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("colStatus")}</th>
                  <th className="px-5 py-3 w-24" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sorted.map((city, idx) => (
                  <tr key={city.id} className={`hover:bg-gray-50/50 transition-colors ${!city.isActive ? "opacity-50" : ""}`}>
                    {/* Order controls */}
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0 || reorder.isPending}
                          onClick={() => {
                            const prev = sorted[idx - 1]
                            reorder.mutate({ id: city.id, order: prev.order - 1 })
                          }}
                          className="text-gray-300 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-xs text-gray-400 text-center">{city.order}</span>
                        <button
                          type="button"
                          disabled={idx === sorted.length - 1 || reorder.isPending}
                          onClick={() => {
                            const next = sorted[idx + 1]
                            reorder.mutate({ id: city.id, order: next.order + 1 })
                          }}
                          className="text-gray-300 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">{city.nameFr}</p>
                          <p className="text-xs text-gray-400">{city.name}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className="text-gray-600" dir="rtl">{city.nameAr}</span>
                    </td>

                    <td className="px-5 py-3 hidden lg:table-cell">
                      <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{city.code}</span>
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 text-blue-600">
                        <Users className="h-3.5 w-3.5" />
                        <span className="font-semibold">{city._count.users}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 text-purple-600">
                        <Briefcase className="h-3.5 w-3.5" />
                        <span className="font-semibold">{city._count.providers}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${city.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {city.isActive ? t("statusActive") : t("statusInactive")}
                      </span>
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          onClick={() => setEditCity(city)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={toggleActive.isPending}
                          onClick={() => toggleActive.mutate({ id: city.id, isActive: !city.isActive })}
                          className={`p-1.5 rounded-lg transition-colors ${city.isActive ? "text-gray-400 hover:text-red-600 hover:bg-red-50" : "text-gray-400 hover:text-green-600 hover:bg-green-50"}`}
                          title={city.isActive ? "Deactivate" : "Activate"}
                        >
                          {city.isActive ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {adding && <CityModal onClose={() => setAdding(false)} />}
      {editCity && <CityModal city={editCity} onClose={() => setEditCity(null)} />}
    </div>
  )
}
