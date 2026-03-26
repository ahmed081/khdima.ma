"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@/i18n/navigation"
import { useState, useEffect, useCallback } from "react"
import { useTranslations, useLocale } from "next-intl"
import {
  ArrowLeft, Building2, FileText, Sparkles, Clock,
  CheckCircle, AlertCircle, Loader2, Globe, Phone,
  MessageCircle, Link as LinkIcon, MapPin, Briefcase,
  Image as ImageIcon, Zap, ChevronRight, Save,
} from "lucide-react"
import { WorkingHoursEditor, type WorkingHoursData } from "@/components/provider/working-hours-editor"
import { Link } from "@/i18n/navigation"

// ─── Types ─────────────────────────────────────────────────────────────────

interface Category { id: number; code: string; slug: string; icon?: string; name: string }
interface City     { id: number; code: string; name: string }
interface Subcategory { id: number; code: string; slug: string; name: string }

interface ProviderData {
  id: number
  businessName: string
  bio: string | null
  bioFr: string | null
  bioAr: string | null
  phone: string
  whatsapp: string | null
  website: string | null
  avatarUrl: string | null
  cityId: number
  categoryId: number
  yearsExperience: number | null
  availability: string
  workingHours: WorkingHoursData | null
  subcategories: { subcategoryId: number; subcategory: { id: number; code: string } }[]
  category: { id: number; code: string; slug: string }
  city: { id: number; name: string }
}

type TabId = "business" | "about" | "specialties" | "hours"

// ─── Tab config ────────────────────────────────────────────────────────────

const TABS: { id: TabId; icon: React.ReactNode }[] = [
  { id: "business",    icon: <Building2 className="h-4 w-4" /> },
  { id: "about",       icon: <FileText className="h-4 w-4" /> },
  { id: "specialties", icon: <Sparkles className="h-4 w-4" /> },
  { id: "hours",       icon: <Clock className="h-4 w-4" /> },
]

const AVAILABILITY_OPTIONS = ["AVAILABLE", "BUSY", "INACTIVE"]

// ─── Notification pill ────────────────────────────────────────────────────

function SaveNotification({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  if (status === "idle") return null
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium transition-all duration-300 ${
      status === "saving" ? "bg-white border border-gray-200 text-gray-600" :
      status === "saved"  ? "bg-green-600 text-white" :
                            "bg-red-600 text-white"
    }`}>
      {status === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
      {status === "saved"  && <CheckCircle className="h-4 w-4" />}
      {status === "error"  && <AlertCircle className="h-4 w-4" />}
      <span>
        {status === "saving" ? "Saving…" : status === "saved" ? "Saved!" : "Save failed"}
      </span>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────

export default function EditProviderProfilePage() {
  const router     = useRouter()
  const locale     = useLocale()
  const t          = useTranslations("editProfile")
  const tp         = useTranslations("provider")
  const isRTL      = locale === "ar"
  const qc         = useQueryClient()

  const [activeTab, setActiveTab] = useState<TabId>("business")
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [bioLang, setBioLang] = useState<"en" | "fr" | "ar">(locale as "en" | "fr" | "ar")

  // ── Form state ──────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    businessName:    "",
    categoryId:      0,
    cityId:          0,
    yearsExperience: "",
    avatarUrl:       "",
    availability:    "AVAILABLE",
    phone:           "",
    whatsapp:        "",
    website:         "",
    bio:             "",
    bioFr:           "",
    bioAr:           "",
  })
  const [subcategoryIds, setSubcategoryIds] = useState<number[]>([])
  const [workingHours, setWorkingHours] = useState<WorkingHoursData>({})

  // ── Fetch provider data ─────────────────────────────────────────────────
  const { data: provider, isLoading: loadingProvider } = useQuery<ProviderData>({
    queryKey: ["provider-profile-edit"],
    queryFn: () => fetch("/api/provider/profile").then(r => r.json()),
  })

  useEffect(() => {
    if (!provider || (provider as any).error) return
    setForm({
      businessName:    provider.businessName ?? "",
      categoryId:      provider.categoryId   ?? 0,
      cityId:          provider.cityId        ?? 0,
      yearsExperience: provider.yearsExperience?.toString() ?? "",
      avatarUrl:       provider.avatarUrl      ?? "",
      availability:    provider.availability   ?? "AVAILABLE",
      phone:           provider.phone          ?? "",
      whatsapp:        provider.whatsapp        ?? "",
      website:         provider.website         ?? "",
      bio:             provider.bio             ?? "",
      bioFr:           provider.bioFr           ?? "",
      bioAr:           provider.bioAr           ?? "",
    })
    setSubcategoryIds(provider.subcategories?.map(s => s.subcategoryId) ?? [])
    setWorkingHours((provider.workingHours as WorkingHoursData | null) ?? {})
  }, [provider])

  // ── Fetch categories ────────────────────────────────────────────────────
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories", locale],
    queryFn: () => fetch(`/api/categories?locale=${locale}`).then(r => r.json()),
  })

  // ── Fetch cities ────────────────────────────────────────────────────────
  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ["cities", locale],
    queryFn: () => fetch(`/api/cities?locale=${locale}`).then(r => r.json()),
  })

  // ── Fetch subcategories (based on selected categoryId) ──────────────────
  const { data: subcategories = [] } = useQuery<Subcategory[]>({
    queryKey: ["subcategories", form.categoryId, locale],
    queryFn: () => fetch(`/api/categories/${form.categoryId}/subcategories?locale=${locale}`).then(r => r.json()),
    enabled: form.categoryId > 0,
  })

  // ── Save mutation ────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch("/api/provider/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Update failed")
      return data
    },
    onMutate:  () => setSaveStatus("saving"),
    onSuccess: () => {
      setSaveStatus("saved")
      qc.invalidateQueries({ queryKey: ["provider-profile-edit"] })
      qc.invalidateQueries({ queryKey: ["provider-dashboard"] })
      setTimeout(() => setSaveStatus("idle"), 2500)
    },
    onError: () => {
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    },
  })

  // ── Per-tab save payloads ────────────────────────────────────────────────
  const saveTab = useCallback(() => {
    const payloads: Record<TabId, Record<string, unknown>> = {
      business: {
        businessName:    form.businessName || undefined,
        categoryId:      form.categoryId   || undefined,
        cityId:          form.cityId       || undefined,
        yearsExperience: form.yearsExperience ? parseInt(form.yearsExperience) : undefined,
        avatarUrl:       form.avatarUrl    || undefined,
        availability:    form.availability,
        phone:           form.phone,
        whatsapp:        form.whatsapp     || undefined,
        website:         form.website      || undefined,
      },
      about: {
        bio:   form.bio   || null,
        bioFr: form.bioFr || null,
        bioAr: form.bioAr || null,
      },
      specialties: { subcategoryIds },
      hours: { workingHours },
    }
    saveMutation.mutate(payloads[activeTab])
  }, [activeTab, form, subcategoryIds, workingHours, saveMutation])

  // ── Helpers ──────────────────────────────────────────────────────────────
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }))

  const toggleSubcat = (id: number) =>
    setSubcategoryIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )

  const bioMap: Record<"en" | "fr" | "ar", keyof typeof form> = { en: "bio", fr: "bioFr", ar: "bioAr" }

  // ── Current provider display name ─────────────────────────────────────
  const displayName = form.businessName || provider?.businessName || "…"
  const avatarLetter = displayName?.[0]?.toUpperCase() ?? "?"
  const currentCatName = categories.find(c => c.id === form.categoryId)?.name ?? ""
  const currentCityName = cities.find(c => c.id === form.cityId)?.name ?? ""

  // ── Availability badge ───────────────────────────────────────────────
  const availColor =
    form.availability === "AVAILABLE" ? "bg-green-500" :
    form.availability === "BUSY"      ? "bg-amber-500" : "bg-gray-400"

  if (loadingProvider) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-sm text-gray-500">Loading profile…</p>
        </div>
      </div>
    )
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-slate-50">
      <SaveNotification status={saveStatus} />

      {/* ── Hero Header ───────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-slate-900 via-green-950 to-emerald-900 overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/10" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.02]" />

        <div className="relative mx-auto max-w-4xl px-4 pb-8 pt-6">
          {/* Back link */}
          <Link
            href="/provider/dashboard"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToDashboard")}
          </Link>

          {/* Profile row */}
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="h-24 w-24 overflow-hidden rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur-sm shadow-2xl">
                {form.avatarUrl ? (
                  <img src={form.avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-extrabold text-white/80">
                    {avatarLetter}
                  </div>
                )}
              </div>
              {/* availability dot */}
              <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-900 ${availColor}`} />
            </div>

            {/* Name + meta */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  {displayName}
                </h1>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-0.5 text-xs font-semibold text-emerald-300">
                  {t("title")}
                </span>
              </div>
              <p className="flex flex-wrap items-center gap-3 text-sm text-white/60">
                {currentCatName && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {currentCatName}
                  </span>
                )}
                {currentCityName && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {currentCityName}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-4xl px-4">
          <nav className="flex gap-1 overflow-x-auto py-2 scrollbar-none">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-green-600 text-white shadow-md shadow-green-600/30"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                {tab.icon}
                {t(`tabs.${tab.id}`)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Tab Content ───────────────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl px-4 py-8">

        {/* ═══ TAB 1: Business & Contact ═══════════════════════════════ */}
        {activeTab === "business" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Business Identity card */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                <h2 className="flex items-center gap-2 font-bold text-gray-800">
                  <Building2 className="h-4 w-4 text-green-600" />
                  {t("business.title")}
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">{t("business.subtitle")}</p>
              </div>

              <div className="p-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Business name */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    {t("business.businessName")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={set("businessName")}
                    placeholder={t("business.businessNamePlaceholder")}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition"
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    {t("business.category")}
                  </label>
                  <div className="relative">
                    <select
                      value={form.categoryId}
                      onChange={set("categoryId")}
                      className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition"
                    >
                      <option value={0}>{t("business.selectCategory")}</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <ChevronRight className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 rotate-90 text-gray-400" />
                  </div>
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    {t("business.city")}
                  </label>
                  <div className="relative">
                    <select
                      value={form.cityId}
                      onChange={set("cityId")}
                      className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition"
                    >
                      <option value={0}>{t("business.selectCity")}</option>
                      {cities.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <ChevronRight className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 rotate-90 text-gray-400" />
                  </div>
                </div>

                {/* Years experience */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    <Briefcase className="inline h-3.5 w-3.5 text-gray-400 me-1" />
                    {t("business.yearsExperience")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={form.yearsExperience}
                    onChange={set("yearsExperience")}
                    placeholder={t("business.yearsExperiencePlaceholder")}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition"
                  />
                </div>

                {/* Availability */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    <Zap className="inline h-3.5 w-3.5 text-gray-400 me-1" />
                    {t("business.availability")}
                  </label>
                  <div className="relative">
                    <select
                      value={form.availability}
                      onChange={set("availability")}
                      className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition"
                    >
                      {AVAILABILITY_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{tp(opt.toLowerCase() as any)}</option>
                      ))}
                    </select>
                    <ChevronRight className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 rotate-90 text-gray-400" />
                  </div>
                </div>

                {/* Avatar URL */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    <ImageIcon className="inline h-3.5 w-3.5 text-gray-400 me-1" />
                    {t("business.avatarUrl")}
                  </label>
                  <input
                    type="url"
                    value={form.avatarUrl}
                    onChange={set("avatarUrl")}
                    placeholder={t("business.avatarUrlPlaceholder")}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition"
                  />
                  {form.avatarUrl && (
                    <div className="mt-2 flex items-center gap-3">
                      <img
                        src={form.avatarUrl}
                        alt="Preview"
                        className="h-12 w-12 rounded-xl border object-cover shadow-sm"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
                      />
                      <span className="text-xs text-gray-500">Photo preview</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact card */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                <h2 className="flex items-center gap-2 font-bold text-gray-800">
                  <Phone className="h-4 w-4 text-green-600" />
                  {locale === "ar" ? "بيانات التواصل" : locale === "en" ? "Contact Details" : "Coordonnées"}
                </h2>
              </div>

              <div className="p-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    <Phone className="inline h-3.5 w-3.5 text-gray-400 me-1" />
                    {t("business.phone")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder={t("business.phonePlaceholder")}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition"
                    required
                  />
                </div>

                {/* WhatsApp */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    <MessageCircle className="inline h-3.5 w-3.5 text-green-500 me-1" />
                    {t("business.whatsapp")}
                  </label>
                  <input
                    type="tel"
                    value={form.whatsapp}
                    onChange={set("whatsapp")}
                    placeholder={t("business.whatsappPlaceholder")}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition"
                  />
                </div>

                {/* Website */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    <LinkIcon className="inline h-3.5 w-3.5 text-gray-400 me-1" />
                    {t("business.website")}
                  </label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={set("website")}
                    placeholder={t("business.websitePlaceholder")}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB 2: About ═══════════════════════════════════════════ */}
        {activeTab === "about" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                <h2 className="flex items-center gap-2 font-bold text-gray-800">
                  <FileText className="h-4 w-4 text-green-600" />
                  {t("about.title")}
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">{t("about.subtitle")}</p>
              </div>

              <div className="p-6 space-y-5">
                {/* Language selector tabs */}
                <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
                  {(["fr", "en", "ar"] as const).map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setBioLang(lang)}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all duration-200 ${
                        bioLang === lang
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Globe className="h-3.5 w-3.5" />
                      {t(`about.lang${lang.charAt(0).toUpperCase() + lang.slice(1)}` as any)}
                    </button>
                  ))}
                </div>

                {/* Textarea with RTL for Arabic */}
                <div dir={bioLang === "ar" ? "rtl" : "ltr"} className="space-y-1.5">
                  <textarea
                    key={bioLang}
                    value={form[bioMap[bioLang]]}
                    onChange={set(bioMap[bioLang])}
                    placeholder={t("about.bioPlaceholder")}
                    rows={8}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition resize-none leading-relaxed"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{t("about.tip")}</span>
                    <span>{String(form[bioMap[bioLang]]).length} {t("about.chars")}</span>
                  </div>
                </div>

                {/* Language fill status */}
                <div className="flex gap-3 flex-wrap">
                  {(["fr", "en", "ar"] as const).map(lang => {
                    const filled = !!form[bioMap[lang]]
                    return (
                      <div key={lang} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${
                        filled ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-400"
                      }`}>
                        {filled ? <CheckCircle className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border border-gray-300" />}
                        {t(`about.lang${lang.charAt(0).toUpperCase() + lang.slice(1)}` as any)}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB 3: Specialties ═══════════════════════════════════ */}
        {activeTab === "specialties" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="flex items-center gap-2 font-bold text-gray-800">
                      <Sparkles className="h-4 w-4 text-green-600" />
                      {t("specialties.title")}
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-500">{t("specialties.subtitle")}</p>
                  </div>
                  {subcategoryIds.length > 0 && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      {subcategoryIds.length} {t("specialties.selected")}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                {form.categoryId === 0 ? (
                  <div className="flex flex-col items-center py-10 text-center text-gray-400">
                    <Sparkles className="h-10 w-10 mb-3 opacity-30" />
                    <p className="text-sm">
                      {locale === "ar" ? "اختر فئة أولاً" : locale === "en" ? "Select a category first" : "Choisissez d'abord une catégorie"}
                    </p>
                  </div>
                ) : subcategories.length === 0 ? (
                  <div className="flex flex-col items-center py-10 text-center text-gray-400">
                    <Sparkles className="h-10 w-10 mb-3 opacity-30" />
                    <p className="text-sm">{t("specialties.noSubcategories")}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {subcategories.map(sub => {
                      const checked = subcategoryIds.includes(sub.id)
                      return (
                        <label
                          key={sub.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all duration-150 ${
                            checked
                              ? "border-green-400 bg-green-50 shadow-sm"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className={`h-5 w-5 flex-shrink-0 rounded-md border-2 transition-all duration-150 flex items-center justify-center ${
                            checked ? "border-green-600 bg-green-600" : "border-gray-300"
                          }`}>
                            {checked && (
                              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={checked}
                            onChange={() => toggleSubcat(sub.id)}
                          />
                          <span className={`text-sm font-medium ${checked ? "text-green-800" : "text-gray-700"}`}>
                            {sub.name}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB 4: Working Hours ══════════════════════════════════ */}
        {activeTab === "hours" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                <h2 className="flex items-center gap-2 font-bold text-gray-800">
                  <Clock className="h-4 w-4 text-green-600" />
                  {t("hours.title")}
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">{t("hours.subtitle")}</p>
              </div>

              <div className="p-6">
                <WorkingHoursEditor
                  value={workingHours}
                  onChange={setWorkingHours}
                  locale={locale}
                />
              </div>
            </div>

            {/* Preview card */}
            {Object.values(workingHours).some(d => d?.open) && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-3">
                  <h3 className="text-sm font-semibold text-gray-700">
                    {locale === "ar" ? "معاينة" : locale === "en" ? "Preview" : "Aperçu"}
                  </h3>
                </div>
                <div className="p-4 flex flex-wrap gap-2">
                  {(["MON","TUE","WED","THU","FRI","SAT","SUN"] as const).map(day => {
                    const s = workingHours[day]
                    if (!s?.open) return null
                    const labels = { MON: locale === "ar" ? "الاثنين" : locale === "en" ? "Mon" : "Lun", TUE: locale === "ar" ? "الثلاثاء" : locale === "en" ? "Tue" : "Mar", WED: locale === "ar" ? "الأربعاء" : locale === "en" ? "Wed" : "Mer", THU: locale === "ar" ? "الخميس" : locale === "en" ? "Thu" : "Jeu", FRI: locale === "ar" ? "الجمعة" : locale === "en" ? "Fri" : "Ven", SAT: locale === "ar" ? "السبت" : locale === "en" ? "Sat" : "Sam", SUN: locale === "ar" ? "الأحد" : locale === "en" ? "Sun" : "Dim" }
                    return (
                      <div key={day} className="flex items-center gap-1.5 rounded-xl bg-green-50 border border-green-200 px-3 py-1.5 text-xs font-medium text-green-800">
                        <span className="font-bold">{labels[day]}</span>
                        <span className="text-green-600">{s.from}–{s.to}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Save bar ──────────────────────────────────────────────── */}
        <div className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sticky bottom-4">
          <button
            type="button"
            onClick={() => router.push("/provider/dashboard")}
            className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("cancel")}
          </button>

          <button
            type="button"
            onClick={saveTab}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-green-600/30 transition hover:from-green-500 hover:to-emerald-500 disabled:opacity-60 active:scale-95"
          >
            {saveMutation.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" />{t("saving")}</>
            ) : (
              <><Save className="h-4 w-4" />{t("save")}</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
