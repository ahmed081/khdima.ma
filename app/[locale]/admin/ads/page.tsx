"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { useDispatch } from "react-redux"
import { showToast } from "@/store/slices/toastSlice"
import {
  ArrowLeft, Megaphone, Eye, EyeOff, Save, Loader2,
  ExternalLink, Image as ImageIcon, Link2, AlignLeft, LayoutTemplate,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// All keys that exist in the Param table for ad settings
const AD_KEYS = [
  "AD_LEFT_ENABLED",   "AD_LEFT_SIZE",   "AD_LEFT_IMAGE_URL",  "AD_LEFT_LINK_URL",  "AD_LEFT_ALT",
  "AD_RIGHT_ENABLED",  "AD_RIGHT_SIZE",  "AD_RIGHT_IMAGE_URL", "AD_RIGHT_LINK_URL", "AD_RIGHT_ALT",
] as const
type AdKey = typeof AD_KEYS[number]
type AdState = Partial<Record<AdKey, string>>

const HEIGHT_MAP: Record<string, string> = { sm: "120px", md: "220px", lg: "350px" }

// ── Per-slot panel ─────────────────────────────────────────────────────────────
function AdSlotPanel({
  side,
  state,
  onUpdate,
}: {
  side: "LEFT" | "RIGHT"
  state: AdState
  onUpdate: (patch: Partial<AdState>) => void
}) {
  const t = useTranslations("admin")

  // Typed key helpers so we never use `as any`
  const KEY_ENABLED:   AdKey = `AD_${side}_ENABLED`
  const KEY_SIZE:      AdKey = `AD_${side}_SIZE`
  const KEY_IMAGE_URL: AdKey = `AD_${side}_IMAGE_URL`
  const KEY_LINK_URL:  AdKey = `AD_${side}_LINK_URL`
  const KEY_ALT:       AdKey = `AD_${side}_ALT`

  const enabled  = state[KEY_ENABLED]   === "true"
  const size     = state[KEY_SIZE]      || "sm"
  const imageUrl = state[KEY_IMAGE_URL] || ""
  const linkUrl  = state[KEY_LINK_URL]  || ""
  const alt      = state[KEY_ALT]       || ""
  const height   = HEIGHT_MAP[size] ?? HEIGHT_MAP.sm

  const SIZE_LABELS: Record<string, string> = {
    sm: t("adSizeSm"),
    md: t("adSizeMd"),
    lg: t("adSizeLg"),
  }

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${enabled ? "border-green-200" : "border-gray-100"}`}>
      {/* Header */}
      <div className={`px-5 py-4 border-b flex items-center justify-between ${enabled ? "bg-green-50/60" : "bg-gray-50"}`}>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${enabled ? "bg-green-100" : "bg-gray-100"}`}>
            <LayoutTemplate className={`h-4 w-4 ${enabled ? "text-green-600" : "text-gray-400"}`} />
          </div>
          <span className="font-semibold text-gray-800">
            {side === "LEFT" ? t("leftAd") : t("rightAd")}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onUpdate({ [KEY_ENABLED]: enabled ? "false" : "true" })}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            enabled
              ? "bg-green-600 text-white border-green-600 hover:bg-green-500"
              : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
          }`}
        >
          {enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          {enabled ? t("adEnabled") : t("adDisabled")}
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Preview box */}
        <div
          className="w-full rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all"
          style={{
            height,
            borderColor: enabled ? "#86efac" : "#e5e7eb",
            background:  enabled ? "#f0fdf4" : "#f9fafb",
          }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt={alt || "ad preview"} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-gray-400 text-xs select-none">
              <ImageIcon className="h-6 w-6 mx-auto mb-1 opacity-40" />
              <p>{t("adPreview")}</p>
              <p className="text-gray-300 mt-0.5">{height}</p>
            </div>
          )}
        </div>

        {/* Size picker */}
        <div>
          <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
            {t("adSize")}
          </Label>
          <div className="flex gap-2">
            {(["sm", "md", "lg"] as const).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => onUpdate({ [KEY_SIZE]: s })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  size === s
                    ? "bg-green-700 text-white border-green-700"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                {SIZE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Image URL */}
        <div>
          <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <ImageIcon className="h-3 w-3" /> {t("adImageUrl")}
          </Label>
          <Input
            value={imageUrl}
            onChange={e => onUpdate({ [KEY_IMAGE_URL]: e.target.value })}
            placeholder="https://..."
            className="h-9 text-sm"
          />
        </div>

        {/* Destination URL */}
        <div>
          <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Link2 className="h-3 w-3" /> {t("adLinkUrl")}
          </Label>
          <Input
            value={linkUrl}
            onChange={e => onUpdate({ [KEY_LINK_URL]: e.target.value })}
            placeholder="https://..."
            className="h-9 text-sm"
          />
        </div>

        {/* Alt text */}
        <div>
          <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <AlignLeft className="h-3 w-3" /> {t("adAltText")}
          </Label>
          <Input
            value={alt}
            onChange={e => onUpdate({ [KEY_ALT]: e.target.value })}
            placeholder={t("adAltPlaceholder")}
            className="h-9 text-sm"
          />
        </div>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function AdminAdsPage() {
  const t        = useTranslations("admin")
  const qc       = useQueryClient()
  const dispatch = useDispatch()

  // Server state (loaded from DB)
  const { data: saved = {} as AdState, isLoading } = useQuery<AdState>({
    queryKey: ["admin-ads"],
    queryFn:  () => fetch("/api/admin/ads").then(r => r.json()),
  })

  // Local draft: starts as null (untouched), overrides saved on first change
  const [draft, setDraft] = useState<AdState | null>(null)
  const current: AdState  = draft ?? saved
  const isDirty           = draft !== null

  const applyPatch = (patch: Partial<AdState>) => {
    setDraft(prev => ({ ...(prev ?? saved), ...patch }))
  }

  // Pass `current` as the mutation variable so the closure is never stale
  const saveMutation = useMutation({
    mutationFn: (payload: AdState) =>
      fetch("/api/admin/ads", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      }).then(r => {
        if (!r.ok) throw new Error("save_failed")
        return r.json()
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-ads"] })
      setDraft(null)
      dispatch(showToast({ message: t("adSaved"), type: "success" }))
    },
    onError: () => {
      dispatch(showToast({ message: t("adSaveError"), type: "error" }))
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-green-600" />
              <h1 className="text-xl font-bold text-gray-900">{t("adsTitle")}</h1>
            </div>
            {isDirty && (
              <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                unsaved
              </span>
            )}
          </div>

          <Button
            onClick={() => saveMutation.mutate(current)}
            disabled={saveMutation.isPending || isLoading || !isDirty}
            className="bg-green-600 hover:bg-green-500 text-white gap-2 disabled:opacity-50"
          >
            {saveMutation.isPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Save className="h-4 w-4" />
            }
            {t("saveChangesBtn")}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-3 mb-6 text-sm text-blue-700">
          <ExternalLink className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-400" />
          <p>{t("adsInfoBanner")}</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[0, 1].map(i => <div key={i} className="h-96 bg-white rounded-2xl border animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AdSlotPanel side="LEFT"  state={current} onUpdate={applyPatch} />
            <AdSlotPanel side="RIGHT" state={current} onUpdate={applyPatch} />
          </div>
        )}
      </div>
    </div>
  )
}
