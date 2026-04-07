"use client"

import { useState, useCallback, use } from "react"
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

// ─── Helpers ────────────────────────────────────────────────────────────────

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ")
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2)
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 uppercase">
      {letters}
    </div>
  )
}

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
  isPending: boolean
  disappearing: boolean
  notePlaceholder: string
  approveLabel: string
  rejectLabel: string
  uploadedLabel: string
}

function PhotoCard({
  imageUrl, uploadedAt, caption, note, onNoteChange,
  onApprove, onReject, isPending, disappearing,
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
        {/* Image */}
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
          <div className="absolute top-2 right-2 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            PENDING
          </div>
        </div>

        {/* Meta + actions */}
        <div className="p-4 flex-1 flex flex-col gap-3">
          <p className="text-xs text-gray-400">
            {uploadedLabel}: {formatDate(uploadedAt)}
          </p>

          {/* Rejection note */}
          <input
            type="text"
            value={note}
            onChange={e => onNoteChange(e.target.value)}
            placeholder={notePlaceholder}
            className="text-xs rounded-xl border border-gray-200 px-3 py-2 w-full placeholder:text-gray-300 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
          />

          {/* Buttons */}
          <div className="flex gap-2 mt-auto">
            <button
              onClick={onApprove}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-semibold transition disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
              {approveLabel}
            </button>
            <button
              onClick={onReject}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
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
  count: number
  onApproveAll: () => void
  isBulkPending: boolean
  isEmpty: boolean
  emptyLabel: string
  approveAllLabel: string
  children: React.ReactNode
  gridCols?: string
}

function Section({
  icon, title, count, onApproveAll, isBulkPending,
  isEmpty, emptyLabel, approveAllLabel, children, gridCols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
}: SectionProps) {
  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
            {icon}
          </div>
          <h2 className="font-bold text-gray-900">{title}</h2>
          <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>
        {count > 0 && (
          <button
            onClick={onApproveAll}
            disabled={isBulkPending}
            className="flex items-center gap-1.5 text-xs font-semibold text-green-600 border border-green-200 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-xl transition disabled:opacity-50"
          >
            {isBulkPending
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <CheckCircle className="h-3.5 w-3.5" />}
            {approveAllLabel}
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="flex items-center justify-center py-10 text-center bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-sm text-gray-400">{emptyLabel}</p>
        </div>
      ) : (
        <div className={`grid ${gridCols} gap-4`}>
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function AdminPhotoReviewPage({
  params,
}: {
  params: Promise<{ profileId: string }>
}) {
  const t        = useTranslations("admin")
  const qc       = useQueryClient()
  const dispatch = useDispatch()

  // Unwrap async params (Next.js 15 / React 19)
  const { profileId } = use(params)

  // Notes state
  const [profileNote, setProfileNote]   = useState("")
  const [portfolioNotes, setPortfolioNotes] = useState<Record<number, string>>({})

  // Disappearing photo ids (for fade-out animation)
  const [disappearing, setDisappearing] = useState<Set<string>>(new Set())

  const triggerDisappear = useCallback((key: string, cb: () => void) => {
    setDisappearing(prev => new Set(prev).add(key))
    setTimeout(cb, 300)
  }, [])

  // ── Data fetch ──────────────────────────────────────────────────
  const { data, isLoading } = useQuery<ProfileData>({
    queryKey: ["admin-photos-profile", profileId],
    queryFn: () =>
      fetch(`/api/admin/photos/${profileId}`).then(r => {
        if (!r.ok) throw new Error("fetch failed")
        return r.json()
      }),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-photos-profile", profileId] })

  // ── Mutations ───────────────────────────────────────────────────
  const profileMutation = useMutation({
    mutationFn: (payload: { action: "APPROVED" | "REJECTED"; adminNote?: string }) =>
      fetch(`/api/admin/photos/${profileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "profile", ...payload }),
      }).then(r => { if (!r.ok) throw new Error("failed"); return r.json() }),
    onSuccess: () => {
      invalidate()
      qc.invalidateQueries({ queryKey: ["admin-photos-grouped"] })
      dispatch(showToast({ message: t("photosActionSuccess"), type: "success" }))
    },
    onError: () => dispatch(showToast({ message: t("photosActionError"), type: "error" })),
  })

  const portfolioMutation = useMutation({
    mutationFn: (payload: { id?: number; status?: "APPROVED" | "REJECTED"; adminNote?: string; bulk?: boolean }) =>
      fetch(`/api/admin/photos/${profileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "portfolio", ...payload }),
      }).then(r => { if (!r.ok) throw new Error("failed"); return r.json() }),
    onSuccess: () => {
      invalidate()
      qc.invalidateQueries({ queryKey: ["admin-photos-grouped"] })
      dispatch(showToast({ message: t("photosActionSuccess"), type: "success" }))
    },
    onError: () => dispatch(showToast({ message: t("photosActionError"), type: "error" })),
  })

  // ── Loading ─────────────────────────────────────────────────────
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

  const { provider, portfolioPhotos } = data
  const hasProfilePhoto = !!provider.pendingAvatarUrl
  const pendingPortfolio = portfolioPhotos.filter(p => p.status === "PENDING")
  const totalPending = (hasProfilePhoto ? 1 : 0) + pendingPortfolio.length
  const allDone = totalPending === 0

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ─────────────────────────────────────────────── */}
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

        {/* ── Profile header card ──────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-4">
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

            {/* Summary pill */}
            <div className="flex-shrink-0 flex flex-col items-end gap-1">
              {hasProfilePhoto && (
                <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 font-semibold px-3 py-1 rounded-full">
                  <User className="h-3 w-3" />
                  {t("photosPendingProfile", { count: 1 })}
                </span>
              )}
              {pendingPortfolio.length > 0 && (
                <span className="flex items-center gap-1 text-xs bg-purple-50 text-purple-600 font-semibold px-3 py-1 rounded-full">
                  <ImageIcon className="h-3 w-3" />
                  {t("photosPendingPortfolio", { count: pendingPortfolio.length })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── All done state ───────────────────────────────────── */}
        {allDone && (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-green-100 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
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

        {/* ── Section A: Profile Photos ─────────────────────────── */}
        {!allDone && (
          <Section
            icon={<User className="h-3.5 w-3.5 text-blue-500" />}
            title={t("photosProfileSection")}
            count={hasProfilePhoto ? 1 : 0}
            approveAllLabel={t("photosApproveAll")}
            emptyLabel={t("photosNoPendingSection")}
            isEmpty={!hasProfilePhoto}
            isBulkPending={profileMutation.isPending}
            onApproveAll={() =>
              triggerDisappear("profile", () =>
                profileMutation.mutate({ action: "APPROVED" })
              )
            }
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
                isPending={profileMutation.isPending}
                notePlaceholder={t("photosNotePlaceholder")}
                approveLabel={t("photosApprove")}
                rejectLabel={t("photosReject")}
                uploadedLabel={t("photosUploaded")}
                onApprove={() =>
                  triggerDisappear("profile", () =>
                    profileMutation.mutate({ action: "APPROVED" })
                  )
                }
                onReject={() =>
                  triggerDisappear("profile", () =>
                    profileMutation.mutate({ action: "REJECTED", adminNote: profileNote || undefined })
                  )
                }
              />
            )}
          </Section>
        )}

        {/* ── Section B: Portfolio Photos ───────────────────────── */}
        {!allDone && (
          <Section
            icon={<ImageIcon className="h-3.5 w-3.5 text-purple-500" />}
            title={t("photosPortfolioSection")}
            count={pendingPortfolio.length}
            approveAllLabel={t("photosApproveAll")}
            emptyLabel={t("photosNoPendingSection")}
            isEmpty={pendingPortfolio.length === 0}
            isBulkPending={portfolioMutation.isPending && !portfolioMutation.variables?.id}
            onApproveAll={() =>
              portfolioMutation.mutate({ bulk: true })
            }
            gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {pendingPortfolio.map(photo => {
              const key = `portfolio-${photo.id}`
              return (
                <PhotoCard
                  key={photo.id}
                  imageUrl={photo.url}
                  uploadedAt={photo.createdAt}
                  caption={photo.caption}
                  note={portfolioNotes[photo.id] ?? ""}
                  onNoteChange={val => setPortfolioNotes(p => ({ ...p, [photo.id]: val }))}
                  disappearing={disappearing.has(key)}
                  isPending={portfolioMutation.isPending && portfolioMutation.variables?.id === photo.id}
                  notePlaceholder={t("photosNotePlaceholder")}
                  approveLabel={t("photosApprove")}
                  rejectLabel={t("photosReject")}
                  uploadedLabel={t("photosUploaded")}
                  onApprove={() =>
                    triggerDisappear(key, () =>
                      portfolioMutation.mutate({ id: photo.id, status: "APPROVED" })
                    )
                  }
                  onReject={() =>
                    triggerDisappear(key, () =>
                      portfolioMutation.mutate({
                        id: photo.id,
                        status: "REJECTED",
                        adminNote: portfolioNotes[photo.id] || undefined,
                      })
                    )
                  }
                />
              )
            })}
          </Section>
        )}
      </div>
    </div>
  )
}
