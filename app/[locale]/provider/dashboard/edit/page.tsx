"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@/i18n/navigation"
import { useState, useEffect, useCallback } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useDispatch } from "react-redux"
import { showToast } from "@/store/slices/toastSlice"
import {
  ArrowLeft, Building2, FileText, Sparkles, Clock,
  CheckCircle, AlertCircle, Loader2, Globe, Phone,
  MessageCircle, Link as LinkIcon, MapPin, Briefcase,
  Image as ImageIcon, Zap, ChevronRight, Save,
  Camera, Plus, Trash2, Upload, X, Clock3,
} from "lucide-react"
import { WorkingHoursEditor, type WorkingHoursData } from "@/components/provider/working-hours-editor"
import { Link } from "@/i18n/navigation"
import { CategoryCombobox } from "@/components/category-combobox"

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

type TabId = "business" | "about" | "specialties" | "hours" | "photos"

// ─── Tab config ────────────────────────────────────────────────────────────

const TABS: { id: TabId; icon: React.ReactNode }[] = [
  { id: "business",    icon: <Building2 className="h-4 w-4" /> },
  { id: "about",       icon: <FileText className="h-4 w-4" /> },
  { id: "specialties", icon: <Sparkles className="h-4 w-4" /> },
  { id: "hours",       icon: <Clock className="h-4 w-4" /> },
  { id: "photos",      icon: <Camera className="h-4 w-4" /> },
]

const AVAILABILITY_OPTIONS = ["AVAILABLE", "BUSY", "INACTIVE"]

// ─── Notification pill ────────────────────────────────────────────────────

function SaveNotification({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  const t = useTranslations("editProfile")
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
        {status === "saving" ? t("saving") : status === "saved" ? t("saved") : t("saveError")}
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
  const dispatch   = useDispatch()

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

  // ── Photos tab state ──────────────────────────────────────────────────────
  const [photoForm, setPhotoForm] = useState({ url: "", caption: "" })
  const [photoErr,  setPhotoErr]  = useState("")
  const [showPhotoForm, setShowPhotoForm] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)

  // ── Avatar upload state ──────────────────────────────────────────────────
  const [avatarUploading, setAvatarUploading] = useState(false)

  const uploadFile = async (file: File): Promise<string> => {
    const fd = new FormData()
    fd.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? "Upload failed")
    return data.url as string
  }

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

  // ── Portfolio queries ────────────────────────────────────────────────────
  const { data: portfolioImages = [], isLoading: loadingPhotos } = useQuery<{
    id: number; url: string; caption: string | null; order: number; status: string; adminNote: string | null
  }[]>({
    queryKey: ["portfolio"],
    queryFn: () => fetch("/api/provider/portfolio").then(r => r.json()),
    enabled: activeTab === "photos",
  })

  const addPhotoMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/provider/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(photoForm),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error ?? "Error")
      return d
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portfolio"] })
      setPhotoForm({ url: "", caption: "" })
      setShowPhotoForm(false)
      setPhotoErr("")
    },
    onError: (e: any) => setPhotoErr(e.message),
  })

  const deletePhotoMutation = useMutation({
    mutationFn: (id: number) =>
      fetch("/api/provider/portfolio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portfolio"] }),
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
    if (activeTab === "photos") return // photos are saved immediately per action
    const payloads: Record<Exclude<TabId, "photos">, Record<string, unknown>> = {
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
    saveMutation.mutate(payloads[activeTab as Exclude<TabId, "photos">])
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
          <p className="text-sm text-gray-500">{t("loadingProfile")}</p>
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
                  <CategoryCombobox
                    value={form.categoryId ? String(form.categoryId) : ""}
                    onChange={v => setForm(p => ({ ...p, categoryId: v ? Number(v) : 0 }))}
                    placeholder={t("business.selectCategory")}
                  />
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

                {/* Avatar Upload */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    <Camera className="inline h-3.5 w-3.5 text-gray-400 me-1" />
                    {t("business.avatarUrl")}
                  </label>
                  <div className="flex items-center gap-4">
                    {/* Preview */}
                    <div className="relative flex-shrink-0">
                      <div className="h-20 w-20 rounded-2xl border-2 border-gray-200 overflow-hidden bg-gray-50">
                        {form.avatarUrl ? (
                          <img src={form.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl font-extrabold text-gray-300">
                            {avatarLetter}
                          </div>
                        )}
                      </div>
                      {form.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setForm(p => ({ ...p, avatarUrl: "" }))}
                          className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    {/* Upload button */}
                    <div className="flex-1">
                      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center hover:border-green-400 hover:bg-green-50 transition-colors">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="sr-only"
                          disabled={avatarUploading}
                          onChange={async e => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            try {
                              setAvatarUploading(true)
                              const url = await uploadFile(file)
                              setForm(p => ({ ...p, avatarUrl: url }))
                            } catch (err: any) {
                              dispatch(showToast({ message: err.message ?? t("business.uploadError"), type: "error" }))
                            } finally {
                              setAvatarUploading(false)
                              e.target.value = ""
                            }
                          }}
                        />
                        {avatarUploading ? (
                          <><Loader2 className="h-5 w-5 text-green-600 animate-spin" /><span className="text-xs text-gray-500">{t("business.uploading")}</span></>
                        ) : (
                          <><Upload className="h-5 w-5 text-gray-400" /><span className="text-xs font-medium text-gray-500">{t("business.clickToUpload")}</span><span className="text-[10px] text-gray-400">JPG, PNG, WebP — max 5 MB</span></>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact card */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                <h2 className="flex items-center gap-2 font-bold text-gray-800">
                  <Phone className="h-4 w-4 text-green-600" />
                  {t("business.contactTitle")}
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
                      {t("specialties.selectCategoryFirst")}
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
                    {t("hours.preview")}
                  </h3>
                </div>
                <div className="p-4 flex flex-wrap gap-2">
                  {(["MON","TUE","WED","THU","FRI","SAT","SUN"] as const).map(day => {
                    const s = workingHours[day]
                    if (!s?.open) return null
                    return (
                      <div key={day} className="flex items-center gap-1.5 rounded-xl bg-green-50 border border-green-200 px-3 py-1.5 text-xs font-medium text-green-800">
                        <span className="font-bold">{t(`hours.daysShort.${day}`)}</span>
                        <span className="text-green-600">{s.from}–{s.to}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB 5: Photos ════════════════════════════════════════ */}
        {activeTab === "photos" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 font-bold text-gray-800">
                      <Camera className="h-4 w-4 text-green-600" />
                      {t("photos.title")}
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-500">{t("photos.subtitle")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-500">
                      {portfolioImages.length}/10
                    </span>
                    {portfolioImages.length < 10 && (
                      <button
                        type="button"
                        onClick={() => { setShowPhotoForm(v => !v); setPhotoErr("") }}
                        className="flex items-center gap-2 rounded-xl bg-green-600 hover:bg-green-500 text-white px-4 py-2 text-sm font-semibold shadow-md shadow-green-600/20 transition active:scale-95"
                      >
                        <Plus className="h-4 w-4" />
                        {t("photos.add")}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Add photo form */}
              {showPhotoForm && (
                <div className="border-b border-slate-100 bg-green-50/30 px-6 py-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* File upload area */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-700">
                        {t("photos.urlLabel")} <span className="text-red-500">*</span>
                      </label>
                      {photoForm.url ? (
                        <div className="relative inline-block">
                          <img
                            src={photoForm.url}
                            alt="Preview"
                            className="h-32 w-32 rounded-xl object-cover border border-gray-200 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setPhotoForm(p => ({ ...p, url: "" }))}
                            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${photoUploading ? "border-green-300 bg-green-50" : "border-gray-300 bg-white hover:border-green-400 hover:bg-green-50"}`}>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="sr-only"
                            disabled={photoUploading}
                            onChange={async e => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              try {
                                setPhotoUploading(true)
                                setPhotoErr("")
                                const url = await uploadFile(file)
                                setPhotoForm(p => ({ ...p, url }))
                              } catch (err: any) {
                                setPhotoErr(err.message)
                              } finally {
                                setPhotoUploading(false)
                                e.target.value = ""
                              }
                            }}
                          />
                          {photoUploading ? (
                            <>
                              <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                              <span className="text-sm text-gray-500">{t("photos.uploading")}</span>
                            </>
                          ) : (
                            <>
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                                <Upload className="h-6 w-6 text-gray-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">
                                  {t("photos.clickToUpload")}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP — max 5 MB</p>
                              </div>
                            </>
                          )}
                        </label>
                      )}
                    </div>

                    {/* Caption */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-700">
                        {t("photos.captionLabel")}
                      </label>
                      <input
                        type="text"
                        value={photoForm.caption}
                        onChange={e => setPhotoForm(p => ({ ...p, caption: e.target.value }))}
                        placeholder={t("photos.captionPlaceholder")}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition"
                      />
                    </div>

                  </div>

                  {photoErr && (
                    <p className="mt-3 flex items-center gap-1.5 text-sm text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" />{photoErr}
                    </p>
                  )}

                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoErr("")
                        if (!photoForm.url) {
                          setPhotoErr(t("photos.noPhotoError"))
                          return
                        }
                        addPhotoMutation.mutate()
                      }}
                      disabled={addPhotoMutation.isPending || !photoForm.url}
                      className="flex items-center gap-2 rounded-xl bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 text-sm font-semibold shadow-md transition active:scale-95 disabled:opacity-60"
                    >
                      {addPhotoMutation.isPending
                        ? <><Loader2 className="h-4 w-4 animate-spin" />{t("photos.saving")}</>
                        : <><CheckCircle className="h-4 w-4" />{t("photos.save")}</>
                      }
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowPhotoForm(false); setPhotoErr(""); setPhotoForm({ url: "", caption: "" }) }}
                      className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      {t("photos.cancel")}
                    </button>
                  </div>
                </div>
              )}

              {/* Photos grid */}
              <div className="p-6">
                {loadingPhotos ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
                    ))}
                  </div>
                ) : portfolioImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                      <Camera className="h-8 w-8 text-gray-300" />
                    </div>
                    <p className="text-gray-400 text-sm mb-4">{t("photos.empty")}</p>
                    <p className="text-xs text-gray-300 max-w-xs">{t("photos.hint")}</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-gray-400 mb-4">{t("photos.hint")}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {portfolioImages.map((img) => (
                        <div key={img.id} className="flex flex-col">
                        <div className="relative group rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                          <div className="aspect-square">
                          <img
                            src={img.url}
                            alt={img.caption ?? ""}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          </div>
                          {img.status === "PENDING" && (
                            <span className="absolute top-2 start-2 bg-amber-500/90 backdrop-blur text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                              <Clock3 className="h-2.5 w-2.5" />{t("photos.statusPending")}
                            </span>
                          )}
                          {img.status === "REJECTED" && (
                            <span className="absolute top-2 start-2 bg-red-600/90 backdrop-blur text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                              <AlertCircle className="h-2.5 w-2.5" />{t("photos.statusRejected")}
                            </span>
                          )}
                          {img.status === "APPROVED" && (
                            <span className="absolute top-2 start-2 bg-green-600/90 backdrop-blur text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                              <CheckCircle className="h-2.5 w-2.5" />{t("photos.statusApproved")}
                            </span>
                          )}
                          {img.caption && (
                            <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-white text-xs truncate font-medium">{img.caption}</p>
                            </div>
                          )}
                          {/* Delete overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => deletePhotoMutation.mutate(img.id)}
                              disabled={deletePhotoMutation.isPending}
                              className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg transition active:scale-90"
                              title={t("photos.delete")}
                            >
                              {deletePhotoMutation.isPending
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <Trash2 className="h-4 w-4" />
                              }
                            </button>
                          </div>
                        </div>
                        {img.status === "REJECTED" && img.adminNote && (
                          <p className="text-xs text-red-600 mt-1 px-1 flex items-start gap-1">
                            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            {img.adminNote}
                          </p>
                        )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
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

          {activeTab !== "photos" && (
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
          )}
        </div>
      </div>
    </div>
  )
}
