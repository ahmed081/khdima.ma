"use client"

import { useState, use } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { useDispatch } from "react-redux"
import { showToast } from "@/store/slices/toastSlice"
import {
  ArrowLeft, CheckCircle, XCircle, Loader2,
  User, ImageIcon, CheckCircle2, ChevronLeft,
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────────────────────────

interface PortfolioPhoto {
  id: number
  url: string
  caption: string | null
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
}

interface ProviderInfo {
  id: number
  businessName: string
  avatarUrl: string | null
  pendingAvatarUrl: string | null
  categoryCode: string | null
  user: { name: string; email: string; createdAt: string }
}

interface ProfileData {
  provider: ProviderInfo
  portfolioPhotos: PortfolioPhoto[]
}

// Unified payload union
type ModeratePayload =
  | { type: "profile"; action: "APPROVED" | "REJECTED"; adminNote?: string }
  | { type: "portfolio"; id: number; status: "APPROVED" | "REJECTED"; adminNote?: string }
  | { type: "portfolio"; bulk: true }

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  })
}

// ─── Photo Card ─────────────────────────────────────────────────────────────

interface PhotoCardProps {
  imageUrl: string
  uploadedAt: string
  caption?: string | null
  note: string
  onNoteChange: (val: string) => void
  onApprove: () => void
  onReject: () => void
  isActing: boolean
  disappearing: boolean
  notePlaceholder: string
  approveLabel: string
  rejectLabel: string
  uploadedLabel: string
}

function PhotoCard({
  imageUrl, uploadedAt, caption, note, onNoteChange,
  onApprove, onReject, isActing, disappearing,
  notePlaceholder, approveLabel, rejectLabel, uploadedLabel,
}: PhotoCardProps) {
  const [enlarged, setEnlarged] = useState(false)

  return (
    <>
      <div
        className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all duration-300 ${
          disappearing ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
        }`}
      >
        {/* Image — click to enlarge */}
        <div
          className="relative aspect-video bg-gray-100 cursor-zoom-in overflow-hidden"
          onClick={() => setEnlarged(true)}
        >
          <img
            src={imageUrl}
            alt={caption ?? ""}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          {caption && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
              <p className="text-white text-xs truncate">{caption}</p>
            </div>
          )}
          <div className="absolute top-2 right-2 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            PENDING
          </div>
        </div>

        {/* Meta + actions */}
        <div className="p-4 flex-1 flex flex-col gap-3">
          <p className="text-xs text-gray-400">
            {uploadedLabel}: {formatDate(uploadedAt)}
          </p>

          {/* Optional rejection note */}
          <input
            type="text"
            value={note}
            onChange={e => onNoteChange(e.target.value)}
            placeholder={notePlaceholder}
            className="text-xs rounded-xl border border-gray-200 px-3 py-2 w-full placeholder:text-gray-300 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
          />

          {/* Approve / Reject buttons */}
          <div className="flex gap-2 mt-auto">
            <button
              onClick={onApprove}
              disabled={isActing}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-semibold transition disabled:opacity-50"
            >
              {isActing
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <CheckCircle className="h-3.5 w-3.5" />}
              {approveLabel}
            </button>
            <button
              onClick={onReject}
              disabled={isActing}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition disabled:opacity-50"
            >
              {isActing
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <XCircle className="h-3.5 w-3.5" />}
              {rejectLabel}
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {enlarged && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setEnlarged(false)}
        >
          <img
            src={imageUrl}
            alt={caption ?? ""}
            className="max-w-full max-h-full rounded-xl shadow-2xl object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

interface SectionProps {
  icon: React.ReactNode
  title: string
  pendingCount: number
  onApproveAll: () => void
  isBulkActing: boolean
  emptyLabel: string
  approveAllLabel: string
  children: React.ReactNode
  gridCols?: string
}

function Section({
  icon, title, pendingCount, onApproveAll, isBulkActing,
  emptyLabel, approveAllLabel, children, gridCols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
}: SectionProps) {
  const isEmpty = pendingCount === 0

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
            {icon}
          </div>
          <h2 className="font-bold text-gray-900">{title}</h2>
          {pendingCount > 0 && (
            <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </div>
        {/* Approve All — only visible when there are pending items */}
        {!isEmpty && (
          <button
            onClick={onApproveAll}
            disabled={isBulkActing}
            className="flex items-center gap-1.5 text-xs font-semibold text-green-600 border border-green-200 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-xl transition disabled:opacity-50"
          >
            {isBulkActing
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <CheckCircle className="h-3.5 w-3.5" />}
            {approveAllLabel}
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="flex items-center justify-center py-10 text-center bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="flex items-center gap-2 text-gray-400">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <p className="text-sm">{emptyLabel}</p>
          </div>
        </div>
      ) : (
        <div className={`grid ${gridCols} gap-4`}>
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminPhotoReviewPage({
  params,
}: {
  params: Promise<{ profileId: string }>
}) {
  const t        = useTranslations("admin")
  const qc       = useQueryClient()
  const dispatch = useDispatch()

  const { profileId } = use(params)

  // Per-photo rejection notes
  const [profileNote,    setProfileNote]    = useState("")
  const [portfolioNotes, setPortfolioNotes] = useState<Record<number, string>>({})

  // Tracks which photo keys are mid-fade-out animation
  const [disappearing, setDisappearing] = useState<Set<string>>(new Set())

  const queryKey = ["admin-photos-profile", profileId] as const

  // ── Data fetch ──────────────────────────────────────────────────
  const { data, isLoading } = useQuery<ProfileData>({
    queryKey,
    queryFn: () =>
      fetch(`/api/admin/photos/${profileId}`).then(r => {
        if (!r.ok) throw new Error("fetch failed")
        return r.json()
      }),
  })

  // ── Unified moderation mutation with optimistic updates ─────────
  const moderateMutation = useMutation<unknown, Error, ModeratePayload, { prev: ProfileData | undefined }>({
    mutationFn: (payload) =>
      fetch(`/api/admin/photos/${profileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(r => { if (!r.ok) throw new Error("failed"); return r.json() }),

    // Optimistic: update cache immediately so summary pill / counts refresh right away
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey })
      const prev = qc.getQueryData<ProfileData>(queryKey)

      qc.setQueryData<ProfileData>(queryKey, old => {
        if (!old) return old
        if (payload.type === "profile") {
          // Clear pending profile photo
          return { ...old, provider: { ...old.provider, pendingAvatarUrl: null } }
        }
        if ("bulk" in payload && payload.bulk) {
          // Clear all pending portfolio photos
          return {
            ...old,
            portfolioPhotos: old.portfolioPhotos.filter(p => p.status !== "PENDING"),
          }
        }
        if ("id" in payload && payload.id != null) {
          // Remove single portfolio photo
          return {
            ...old,
            portfolioPhotos: old.portfolioPhotos.filter(p => p.id !== payload.id),
          }
        }
        return old
      })

      return { prev }
    },

    onError: (_err, payload, ctx) => {
      // Rollback cache
      if (ctx?.prev) qc.setQueryData(queryKey, ctx.prev)

      // Re-show faded-out card (remove from disappearing set)
      if (payload.type === "profile") {
        setDisappearing(s => { const n = new Set(s); n.delete("profile"); return n })
      } else if ("id" in payload && payload.id != null) {
        setDisappearing(s => { const n = new Set(s); n.delete(`portfolio-${payload.id}`); return n })
      }

      dispatch(showToast({ message: t("photosActionError"), type: "error" }))
    },

    onSuccess: () => {
      // Refresh the grouped list on Page 1 so badges update
      qc.invalidateQueries({ queryKey: ["admin-photos-grouped"] })
      dispatch(showToast({ message: t("photosActionSuccess"), type: "success" }))
    },

    onSettled: () => {
      // Final sync from server
      qc.invalidateQueries({ queryKey })
    },
  })

  // ── Action helpers ───────────────────────────────────────────────

  /** Trigger fade-out animation + fire mutation simultaneously */
  function moderateProfile(action: "APPROVED" | "REJECTED") {
    setDisappearing(s => new Set(s).add("profile"))
    moderateMutation.mutate({
      type: "profile",
      action,
      adminNote: profileNote || undefined,
    })
  }

  function moderatePortfolio(id: number, status: "APPROVED" | "REJECTED") {
    setDisappearing(s => new Set(s).add(`portfolio-${id}`))
    moderateMutation.mutate({
      type: "portfolio",
      id,
      status,
      adminNote: portfolioNotes[id] || undefined,
    })
  }

  function bulkApprovePortfolio() {
    // All portfolio cards fade out simultaneously
    const pending = data?.portfolioPhotos.filter(p => p.status === "PENDING") ?? []
    if (pending.length > 0) {
      setDisappearing(s => {
        const n = new Set(s)
        pending.forEach(p => n.add(`portfolio-${p.id}`))
        return n
      })
    }
    moderateMutation.mutate({ type: "portfolio", bulk: true })
  }

  // ── Loading / error states ───────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <p className="text-gray-400">Provider not found.</p>
        <Link href="/admin/photos" className="text-sm font-semibold text-purple-600 hover:underline">
          {t("photosBackToProfiles")}
        </Link>
      </div>
    )
  }

  // ── Derived state from (optimistically-updated) cache ────────────
  const { provider, portfolioPhotos } = data

  // Profile photo: comes from provider.pendingAvatarUrl
  const hasProfilePhoto   = !!provider.pendingAvatarUrl
  const pendingPortfolio  = portfolioPhotos.filter(p => p.status === "PENDING")
  const profileCount      = hasProfilePhoto ? 1 : 0
  const portfolioCount    = pendingPortfolio.length
  const totalPending      = profileCount + portfolioCount
  const allDone           = totalPending === 0

  // Is the profile mutation acting on the profile photo specifically?
  const profileIsActing =
    moderateMutation.isPending && moderateMutation.variables?.type === "profile"

  // Is a bulk portfolio action running?
  const portfolioBulkActing =
    moderateMutation.isPending &&
    moderateMutation.variables?.type === "portfolio" &&
    "bulk" in (moderateMutation.variables ?? {})

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Sticky header ──────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link
            href="/admin/photos"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("photosBackToProfiles")}
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-8">

        {/* ── Profile info card ────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Avatar */}
            {provider.avatarUrl ? (
              <img
                src={provider.avatarUrl}
                alt={provider.businessName}
                className="w-14 h-14 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 uppercase">
                {provider.businessName.slice(0, 2)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">{provider.businessName}</h1>
              <p className="text-sm text-gray-400">{provider.user.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {provider.categoryCode && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium uppercase">
                    {provider.categoryCode}
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  {t("photosJoined")} {formatDate(provider.user.createdAt)}
                </span>
              </div>
            </div>

            {/* Live summary pills — update instantly via optimistic cache */}
            <div className="flex-shrink-0 flex flex-wrap gap-2">
              <span className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${
                profileCount > 0
                  ? "bg-blue-50 text-blue-600 ring-1 ring-blue-100"
                  : "bg-gray-50 text-gray-300 ring-1 ring-gray-100"
              }`}>
                <User className="h-3 w-3" />
                {t("photosPendingProfile", { count: profileCount })}
              </span>
              <span className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${
                portfolioCount > 0
                  ? "bg-purple-50 text-purple-600 ring-1 ring-purple-100"
                  : "bg-gray-50 text-gray-300 ring-1 ring-gray-100"
              }`}>
                <ImageIcon className="h-3 w-3" />
                {t("photosPendingPortfolio", { count: portfolioCount })}
              </span>
            </div>
          </div>
        </div>

        {/* ── All done banner (shown on top of sections when 0 remain) ── */}
        {allDone && (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-green-100 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mb-3">
              <CheckCircle2 className="h-7 w-7 text-green-500" />
            </div>
            <p className="font-semibold text-gray-800 mb-1">{t("photosAllReviewed")}</p>
            <Link
              href="/admin/photos"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("photosBackToProfiles")}
            </Link>
          </div>
        )}

        {/* ── Section A: Profile Photos ─────────────────────────────
            Renders independently of portfolio section.
            Shows empty state when pendingAvatarUrl is null.         */}
        <Section
          icon={<User className="h-3.5 w-3.5 text-blue-500" />}
          title={t("photosProfileSection")}
          pendingCount={profileCount}
          approveAllLabel={t("photosApproveAll")}
          emptyLabel={t("photosNoPendingSection")}
          isBulkActing={profileIsActing}
          onApproveAll={() => moderateProfile("APPROVED")}
          gridCols="grid-cols-1 sm:grid-cols-2"
        >
          {hasProfilePhoto && (
            <PhotoCard
              imageUrl={provider.pendingAvatarUrl!}
              uploadedAt={provider.user.createdAt}
              caption={null}
              note={profileNote}
              onNoteChange={setProfileNote}
              disappearing={disappearing.has("profile")}
              isActing={profileIsActing}
              notePlaceholder={t("photosNotePlaceholder")}
              approveLabel={t("photosApprove")}
              rejectLabel={t("photosReject")}
              uploadedLabel={t("photosUploaded")}
              onApprove={() => moderateProfile("APPROVED")}
              onReject={() => moderateProfile("REJECTED")}
            />
          )}
        </Section>

        {/* ── Section B: Portfolio Photos ──────────────────────────
            Renders independently of profile section.
            Shows empty state when no pending portfolio photos.      */}
        <Section
          icon={<ImageIcon className="h-3.5 w-3.5 text-purple-500" />}
          title={t("photosPortfolioSection")}
          pendingCount={portfolioCount}
          approveAllLabel={t("photosApproveAll")}
          emptyLabel={t("photosNoPendingSection")}
          isBulkActing={portfolioBulkActing}
          onApproveAll={bulkApprovePortfolio}
          gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          {pendingPortfolio.map(photo => {
            const isThisActing =
              moderateMutation.isPending &&
              moderateMutation.variables?.type === "portfolio" &&
              "id" in (moderateMutation.variables ?? {}) &&
              (moderateMutation.variables as any).id === photo.id

            return (
              <PhotoCard
                key={photo.id}
                imageUrl={photo.url}
                uploadedAt={photo.createdAt}
                caption={photo.caption}
                note={portfolioNotes[photo.id] ?? ""}
                onNoteChange={val =>
                  setPortfolioNotes(prev => ({ ...prev, [photo.id]: val }))
                }
                disappearing={disappearing.has(`portfolio-${photo.id}`)}
                isActing={isThisActing}
                notePlaceholder={t("photosNotePlaceholder")}
                approveLabel={t("photosApprove")}
                rejectLabel={t("photosReject")}
                uploadedLabel={t("photosUploaded")}
                onApprove={() => moderatePortfolio(photo.id, "APPROVED")}
                onReject={() => moderatePortfolio(photo.id, "REJECTED")}
              />
            )
          })}
        </Section>

      </div>
    </div>
  )
}
