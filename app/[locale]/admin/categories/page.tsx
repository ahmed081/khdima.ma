"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "@/i18n/navigation"
import {
  ArrowLeft, Plus, Pencil, ToggleLeft, ToggleRight,
  ChevronDown, ChevronRight, Loader2, X, Check,
  Tag, Layers, Users, AlertCircle, Trash2,
  Globe, Hash, Sparkles, Save,
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────────────────────────

interface CategoryRow {
  id: number
  code: string
  slug: string
  icon: string | null
  order: number
  isActive: boolean
  translations: Record<string, string>
  providerCount: number
  subcategoryCount: number
}

interface SubcatRow {
  id: number
  code: string
  slug: string
  translations: Record<string, string>
  providerCount: number
}

type DrawerMode = "create-cat" | "edit-cat" | "create-sub" | "edit-sub" | null

// ─── Emoji presets ──────────────────────────────────────────────────────────

const EMOJI_PRESETS = [
  "🔧","⚡","🧹","🪵","🎨","❄️","🚗","📦","🌿","🔒","🏗️","⚙️",
  "🪟","🛁","🔑","🏠","🌊","🔥","🌡️","💡","🔌","🪣","🧰","🛠️",
  "🚿","🪜","🧱","🪞","🖼️","🛋️","🪴","🐛","⛽","🚑","🎯","✨",
]

// ─── Gradient map per code ──────────────────────────────────────────────────

const GRAD: Record<string, string> = {
  PLUMBING:    "from-blue-500 to-blue-700",
  ELECTRICITY: "from-yellow-400 to-amber-600",
  CLEANING:    "from-cyan-500 to-teal-600",
  CARPENTRY:   "from-amber-500 to-orange-600",
  PAINTING:    "from-pink-500 to-rose-600",
  HVAC:        "from-indigo-500 to-blue-700",
  CAR_WASH:    "from-sky-400 to-blue-600",
  MOVING:      "from-orange-500 to-red-600",
  GARDENING:   "from-green-500 to-emerald-600",
  SECURITY:    "from-slate-500 to-gray-700",
  MASONRY:     "from-stone-500 to-stone-700",
  WELDING:     "from-red-500 to-rose-700",
  ALUMINUM:    "from-zinc-400 to-slate-600",
}
const defaultGrad = "from-green-500 to-emerald-700"

// ─── Drawer component ───────────────────────────────────────────────────────

function Drawer({
  open, onClose, title, children,
}: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    if (open) document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      {/* Panel */}
      <div className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-white">
          <h2 className="font-bold text-lg text-gray-900">{title}</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </>
  )
}

// ─── Toast ──────────────────────────────────────────────────────────────────

function Toast({ message, type, onDone }: { message: string; type: "success" | "error"; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-xl text-sm font-medium animate-in slide-in-from-bottom-4 duration-300 ${type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
      {type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      {message}
    </div>
  )
}

// ─── Category form ──────────────────────────────────────────────────────────

const emptyForm = { code: "", slug: "", icon: "", fr: "", en: "", ar: "", order: 0 }

function CategoryForm({
  initial,
  isEdit,
  onSave,
  isPending,
  error,
}: {
  initial: typeof emptyForm
  isEdit: boolean
  onSave: (data: typeof emptyForm) => void
  isPending: boolean
  error: string
}) {
  const [form, setForm] = useState(initial)
  const [tab, setTab]   = useState<"details" | "translations">("details")
  const [emojiOpen, setEmojiOpen] = useState(false)

  // Auto-generate slug from FR name (create only)
  useEffect(() => {
    if (isEdit) return
    const slug = form.fr
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
    setForm(p => ({ ...p, slug }))
  }, [form.fr, isEdit])

  const set = (key: keyof typeof emptyForm, val: string | number) =>
    setForm(p => ({ ...p, [key]: val }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="space-y-5">
      {/* Tab switcher */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {(["details", "translations"] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${tab === t ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            {t === "details" ? "Details" : "Translations"}
          </button>
        ))}
      </div>

      {tab === "details" && (
        <div className="space-y-4">
          {/* Icon picker */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Icon</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setEmojiOpen(v => !v)}
                className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-gray-200 bg-gray-50 text-3xl hover:border-green-400 hover:bg-green-50 transition-colors"
              >
                {form.icon || "➕"}
              </button>
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium">{form.icon ? `Selected: ${form.icon}` : "No icon selected"}</p>
                <p className="text-xs text-gray-400">Click to choose an emoji</p>
              </div>
              {form.icon && (
                <button type="button" onClick={() => set("icon", "")} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
            {emojiOpen && (
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-2xl">
                <div className="grid grid-cols-9 gap-1">
                  {EMOJI_PRESETS.map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => { set("icon", e); setEmojiOpen(false) }}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-xl transition-all hover:scale-110 ${form.icon === e ? "bg-green-100 ring-2 ring-green-500" : "hover:bg-gray-200"}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={form.icon}
                    onChange={e => set("icon", e.target.value)}
                    placeholder="Or type any emoji..."
                    className="flex-1 rounded-xl border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Code — only for create */}
          {!isEdit && (
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                <Hash className="inline h-3.5 w-3.5 text-gray-400 me-1" />
                Code <span className="text-red-500">*</span>
                <span className="text-xs font-normal text-gray-400 ms-1">uppercase, e.g. PLUMBING</span>
              </label>
              <input
                value={form.code}
                onChange={e => set("code", e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""))}
                required
                placeholder="PLUMBING"
                className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm font-mono focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
          )}

          {/* Slug — only for create */}
          {!isEdit && (
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Slug <span className="text-red-500">*</span>
                <span className="text-xs font-normal text-gray-400 ms-1">url-friendly, auto-generated</span>
              </label>
              <input
                value={form.slug}
                onChange={e => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                required
                placeholder="plumbing"
                className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm font-mono focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
          )}

          {/* Order */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Display order</label>
            <input
              type="number"
              value={form.order}
              onChange={e => set("order", parseInt(e.target.value) || 0)}
              min={0}
              className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>
        </div>
      )}

      {tab === "translations" && (
        <div className="space-y-4">
          <p className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-xl p-3">
            Translations are used to display category names in the correct language across the platform.
          </p>

          {[
            { key: "fr" as const, label: "Français", flag: "🇫🇷", placeholder: "ex: Plomberie", dir: "ltr" },
            { key: "en" as const, label: "English",  flag: "🇬🇧", placeholder: "ex: Plumbing",  dir: "ltr" },
            { key: "ar" as const, label: "العربية",  flag: "🇲🇦", placeholder: "مثال: السباكة", dir: "rtl" },
          ].map(({ key, label, flag, placeholder, dir }) => (
            <div key={key} className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span>{flag}</span> {label}
              </label>
              <input
                dir={dir}
                value={form[key]}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold shadow-sm transition-all disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {isPending ? "Saving…" : "Save"}
      </button>
    </form>
  )
}

// ─── Subcategory panel ──────────────────────────────────────────────────────

function SubcatPanel({ categoryId, categoryCode }: { categoryId: number; categoryCode: string }) {
  const qc = useQueryClient()
  const [addOpen,  setAddOpen]  = useState(false)
  const [editItem, setEditItem] = useState<SubcatRow | null>(null)
  const [form, setForm] = useState({ code: "", slug: "", fr: "", en: "", ar: "" })
  const [err,  setErr]  = useState("")
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)

  const key = ["admin-subcats", categoryId]

  const { data: subcats = [], isLoading } = useQuery<SubcatRow[]>({
    queryKey: key,
    queryFn: () => fetch(`/api/admin/categories/${categoryId}/subcategories`).then(r => r.json()),
  })

  const autoSlug = (fr: string) =>
    fr.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

  const saveMutation = useMutation({
    mutationFn: async () => {
      const isEdit = !!editItem
      const url = `/api/admin/categories/${categoryId}/subcategories`
      const body = isEdit
        ? { subcatId: editItem!.id, fr: form.fr, en: form.en, ar: form.ar }
        : { code: form.code, slug: form.slug || autoSlug(form.fr), fr: form.fr, en: form.en, ar: form.ar }
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error ?? "Error")
      return d
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key })
      qc.invalidateQueries({ queryKey: ["admin-categories"] })
      setAddOpen(false)
      setEditItem(null)
      setForm({ code: "", slug: "", fr: "", en: "", ar: "" })
      setErr("")
      setToast({ msg: editItem ? "Subcategory updated" : "Subcategory added", type: "success" })
    },
    onError: (e: any) => setErr(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (subcatId: number) =>
      fetch(`/api/admin/categories/${categoryId}/subcategories`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subcatId }),
      }).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key })
      qc.invalidateQueries({ queryKey: ["admin-categories"] })
      setToast({ msg: "Subcategory deleted", type: "success" })
    },
    onError: (e: any) => setToast({ msg: e.message, type: "error" }),
  })

  const openEdit = (s: SubcatRow) => {
    setEditItem(s)
    setForm({ code: s.code, slug: s.slug, fr: s.translations.fr ?? "", en: s.translations.en ?? "", ar: s.translations.ar ?? "" })
    setAddOpen(true)
    setErr("")
  }

  return (
    <div className="mt-3 border-t border-gray-100 pt-4">
      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5" />
          Subcategories ({subcats.length})
        </p>
        <button
          onClick={() => { setAddOpen(v => !v); setEditItem(null); setForm({ code: "", slug: "", fr: "", en: "", ar: "" }) }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      {/* Add / Edit inline form */}
      {addOpen && (
        <div className="mb-3 rounded-2xl border border-green-200 bg-green-50/40 p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">{editItem ? `Edit: ${editItem.code}` : "New Subcategory"}</p>

          {!editItem && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Code *</label>
                <input
                  value={form.code}
                  onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "") }))}
                  placeholder={`${categoryCode}_REPAIR`}
                  className="w-full h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs font-mono focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Slug</label>
                <input
                  value={form.slug || autoSlug(form.fr)}
                  onChange={e => setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
                  placeholder="auto-generated"
                  className="w-full h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs font-mono focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "fr" as const, flag: "🇫🇷", placeholder: "Réparation" },
              { key: "en" as const, flag: "🇬🇧", placeholder: "Repair" },
              { key: "ar" as const, flag: "🇲🇦", placeholder: "إصلاح", dir: "rtl" },
            ].map(({ key, flag, placeholder, dir }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-500 mb-1">{flag}</label>
                <input
                  dir={dir}
                  value={form[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs focus:outline-none focus:border-green-500"
                />
              </div>
            ))}
          </div>

          {err && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{err}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-semibold transition-colors disabled:opacity-60"
            >
              {saveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              {editItem ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => { setAddOpen(false); setEditItem(null); setErr("") }}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Subcategory list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-8 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : subcats.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">No subcategories yet</p>
      ) : (
        <div className="space-y-1.5">
          {subcats.map(s => (
            <div key={s.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-semibold text-gray-500">{s.code}</span>
                  <span className="text-xs text-gray-400">{s.translations.fr}</span>
                  {s.translations.en && <span className="text-xs text-gray-300">· {s.translations.en}</span>}
                  {s.translations.ar && <span className="text-xs text-gray-400 font-arabic" dir="rtl">· {s.translations.ar}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-gray-400 mr-1">{s.providerCount} pros</span>
                <button
                  onClick={() => openEdit(s)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all"
                >
                  <Pencil className="h-3.5 w-3.5 text-gray-400" />
                </button>
                <button
                  onClick={() => { if (confirm(`Delete "${s.translations.fr || s.code}"?`)) deleteMutation.mutate(s.id) }}
                  disabled={deleteMutation.isPending}
                  className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-red-50 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Category card ──────────────────────────────────────────────────────────

function CategoryCard({
  cat,
  onEdit,
  onToggle,
}: {
  cat: CategoryRow
  onEdit: (c: CategoryRow) => void
  onToggle: (c: CategoryRow) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const grad = GRAD[cat.code] ?? defaultGrad

  return (
    <div className={`rounded-2xl border bg-white shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md ${!cat.isActive ? "opacity-60" : ""}`}>
      {/* Top colour band */}
      <div className={`relative h-2 bg-gradient-to-r ${grad}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${grad} text-3xl shadow-md`}>
            {cat.icon ?? "🔨"}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-extrabold text-gray-900 text-base leading-tight">
                {cat.translations.fr ?? cat.code}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${cat.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                {cat.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Translations row */}
            <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
              {cat.translations.en && <span className="flex items-center gap-1"><span>🇬🇧</span>{cat.translations.en}</span>}
              {cat.translations.ar && <span className="flex items-center gap-1"><span>🇲🇦</span><span dir="rtl">{cat.translations.ar}</span></span>}
            </div>

            {/* Code + slug */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="font-mono text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">{cat.code}</span>
              <span className="text-gray-300 text-xs">/</span>
              <span className="font-mono text-[10px] text-gray-400">{cat.slug}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(cat)}
                className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5 text-gray-400" />
              </button>
              <button
                onClick={() => onToggle(cat)}
                className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
                title={cat.isActive ? "Deactivate" : "Activate"}
              >
                {cat.isActive
                  ? <ToggleRight className="h-5 w-5 text-green-500" />
                  : <ToggleLeft className="h-5 w-5 text-gray-300" />}
              </button>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
              <Users className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <span className="font-semibold text-gray-700">{cat.providerCount}</span>
            <span className="text-gray-400 text-xs">providers</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50">
              <Layers className="h-3.5 w-3.5 text-purple-500" />
            </div>
            <span className="font-semibold text-gray-700">{cat.subcategoryCount}</span>
            <span className="text-gray-400 text-xs">subcategories</span>
          </div>
          <div className="ms-auto">
            <span className="text-xs text-gray-400">Order: {cat.order}</span>
          </div>
        </div>

        {/* Expand subcategories */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-gray-200 text-xs font-medium text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all"
        >
          {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          {expanded ? "Hide" : "Manage"} subcategories
        </button>

        {expanded && <SubcatPanel categoryId={cat.id} categoryCode={cat.code} />}
      </div>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function AdminCategoriesPage() {
  const qc = useQueryClient()
  const [drawerMode,  setDrawerMode]  = useState<DrawerMode>(null)
  const [editTarget,  setEditTarget]  = useState<CategoryRow | null>(null)
  const [drawerError, setDrawerError] = useState("")
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)

  const { data: categories = [], isLoading } = useQuery<CategoryRow[]>({
    queryKey: ["admin-categories"],
    queryFn: () => fetch("/api/admin/categories").then(r => r.json()),
  })

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/admin/categories", {
        method: payload.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error ?? "Error")
      return d
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] })
      setDrawerMode(null)
      setEditTarget(null)
      setDrawerError("")
      setToast({ msg: editTarget ? "Category updated" : "Category created", type: "success" })
    },
    onError: (e: any) => setDrawerError(e.message),
  })

  const toggleMutation = useMutation({
    mutationFn: (cat: CategoryRow) =>
      fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cat.id, isActive: !cat.isActive }),
      }).then(r => r.json()),
    onSuccess: (_, cat) => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] })
      setToast({ msg: cat.isActive ? "Category deactivated" : "Category activated", type: "success" })
    },
  })

  const handleCategorySave = (form: typeof emptyForm) => {
    const payload: any = { ...form, order: parseInt(String(form.order)) }
    if (editTarget) payload.id = editTarget.id
    saveMutation.mutate(payload)
  }

  const openCreate = () => {
    setEditTarget(null)
    setDrawerError("")
    setDrawerMode("create-cat")
  }

  const openEdit = (cat: CategoryRow) => {
    setEditTarget(cat)
    setDrawerError("")
    setDrawerMode("edit-cat")
  }

  // Derived stats
  const active   = categories.filter(c => c.isActive).length
  const inactive = categories.filter(c => !c.isActive).length
  const totalProviders  = categories.reduce((s, c) => s + c.providerCount, 0)
  const totalSubcats    = categories.reduce((s, c) => s + c.subcategoryCount, 0)

  const drawerOpen  = drawerMode === "create-cat" || drawerMode === "edit-cat"
  const drawerTitle = drawerMode === "create-cat" ? "New Category" : `Edit: ${editTarget?.translations.fr ?? editTarget?.code ?? ""}`

  const initialForm = editTarget ? {
    code:  editTarget.code,
    slug:  editTarget.slug,
    icon:  editTarget.icon ?? "",
    order: editTarget.order,
    fr:    editTarget.translations.fr ?? "",
    en:    editTarget.translations.en ?? "",
    ar:    editTarget.translations.ar ?? "",
  } : emptyForm

  return (
    <main className="min-h-screen bg-slate-50">
      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      <Drawer open={drawerOpen} onClose={() => { setDrawerMode(null); setDrawerError("") }} title={drawerTitle}>
        <CategoryForm
          key={editTarget?.id ?? "new"}
          initial={initialForm}
          isEdit={!!editTarget}
          onSave={handleCategorySave}
          isPending={saveMutation.isPending}
          error={drawerError}
        />
      </Drawer>

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto max-w-6xl px-4 py-5">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <Link href="/admin" className="hover:text-gray-700 transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-700 font-medium">Categories</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <Tag className="h-6 w-6 text-green-600" />
                Service Categories
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage categories, icons, translations and subcategories</p>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold text-sm shadow-sm transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              New Category
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* ── Summary cards ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",        value: categories.length, icon: Tag,     color: "text-violet-600", bg: "bg-violet-50",  border: "border-violet-100" },
            { label: "Active",       value: active,            icon: Sparkles, color: "text-green-600",  bg: "bg-green-50",   border: "border-green-100" },
            { label: "Inactive",     value: inactive,          icon: X,        color: "text-gray-500",   bg: "bg-gray-50",    border: "border-gray-200" },
            { label: "Subcategories",value: totalSubcats,      icon: Layers,   color: "text-blue-600",   bg: "bg-blue-50",    border: "border-blue-100" },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <div key={label} className={`rounded-2xl border p-4 ${bg} ${border}`}>
              <Icon className={`h-5 w-5 mb-2 ${color}`} />
              <p className="text-2xl font-extrabold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Category cards ──────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-2 bg-gray-100 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="flex gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gray-100 animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
                    </div>
                  </div>
                  <div className="h-8 bg-gray-50 rounded-xl animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
              <Tag className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-gray-400 font-medium">No categories yet</p>
            <p className="text-gray-300 text-sm mt-1">Click "New Category" to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {categories.map(cat => (
              <CategoryCard
                key={cat.id}
                cat={cat}
                onEdit={openEdit}
                onToggle={(c) => toggleMutation.mutate(c)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
