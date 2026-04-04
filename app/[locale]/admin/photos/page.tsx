"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { useDispatch } from "react-redux"
import { showToast } from "@/store/slices/toastSlice"
import {
  ArrowLeft, Camera, CheckCircle, XCircle, Clock, Loader2,
  ExternalLink, User, AlertCircle,
} from "lucide-react"

type PhotoStatus = "PENDING" | "APPROVED" | "REJECTED"

interface Photo {
  id: number
  url: string
  caption: string | null
  status: PhotoStatus
  adminNote: string | null
  createdAt: string
  provider: {
    id: number
    businessName: string
    user: { name: string; email: string }
  }
}

const STATUS_TABS: PhotoStatus[] = ["PENDING", "APPROVED", "REJECTED"]

export default function AdminPhotosPage() {
  const t        = useTranslations("admin")
  const qc       = useQueryClient()
  const dispatch = useDispatch()

  const [tab, setTab] = useState<PhotoStatus>("PENDING")
  const [noteMap, setNoteMap] = useState<Record<number, string>>({})
  const [actionId, setActionId] = useState<number | null>(null)

  const { data: photos = [], isLoading } = useQuery<Photo[]>({
    queryKey: ["admin-photos", tab],
    queryFn: () => fetch(`/api/admin/photos?status=${tab}`).then(r => r.json()),
  })

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, adminNote }: { id: number; status: PhotoStatus; adminNote?: string }) =>
      fetch("/api/admin/photos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, adminNote }),
      }).then(async r => {
        if (!r.ok) throw new Error("failed")
        return r.json()
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-photos"] })
      setActionId(null)
      dispatch(showToast({ message: t("photosActionSuccess"), type: "success" }))
    },
    onError: () => {
      dispatch(showToast({ message: t("photosActionError"), type: "error" }))
    },
  })

  const handleAction = (id: number, status: PhotoStatus) => {
    setActionId(id)
    reviewMutation.mutate({ id, status, adminNote: noteMap[id] || undefined })
  }

  const TAB_LABELS: Record<PhotoStatus, string> = {
    PENDING:  t("photosTabPending"),
    APPROVED: t("photosTabApproved"),
    REJECTED: t("photosTabRejected"),
  }

  const TAB_ICONS: Record<PhotoStatus, React.ReactNode> = {
    PENDING:  <Clock className="h-4 w-4" />,
    APPROVED: <CheckCircle className="h-4 w-4" />,
    REJECTED: <XCircle className="h-4 w-4" />,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Camera className="h-5 w-5 text-green-600" />
          <h1 className="text-xl font-bold text-gray-900">{t("photosTitle")}</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Status tabs */}
        <div className="flex gap-2 mb-6">
          {STATUS_TABS.map(s => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                tab === s
                  ? s === "PENDING"  ? "bg-amber-500 text-white border-amber-500"
                  : s === "APPROVED" ? "bg-green-600 text-white border-green-600"
                                     : "bg-red-600 text-white border-red-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {TAB_ICONS[s]}
              {TAB_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0,1,2,3,4,5].map(i => (
              <div key={i} className="bg-white rounded-2xl border animate-pulse h-72" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Camera className="h-12 w-12 text-gray-200 mb-3" />
            <p className="text-gray-400">{t("photosEmpty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map(photo => (
              <div key={photo.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                {/* Image */}
                <div className="relative aspect-video bg-gray-100">
                  <img
                    src={photo.url}
                    alt={photo.caption ?? ""}
                    className="w-full h-full object-cover"
                  />
                  {photo.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-white text-xs truncate">{photo.caption}</p>
                    </div>
                  )}
                </div>

                {/* Provider info */}
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{photo.provider.businessName}</p>
                      <p className="text-xs text-gray-400 truncate">{photo.provider.user.email}</p>
                    </div>
                    <a
                      href={`/admin/providers`}
                      className="ml-auto flex-shrink-0 text-gray-300 hover:text-gray-500"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  {/* Existing admin note (for rejected) */}
                  {photo.adminNote && (
                    <div className="flex items-start gap-1.5 bg-red-50 rounded-lg px-3 py-2 text-xs text-red-600">
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      {photo.adminNote}
                    </div>
                  )}

                  {/* Note input (only for PENDING) */}
                  {tab === "PENDING" && (
                    <input
                      type="text"
                      value={noteMap[photo.id] ?? ""}
                      onChange={e => setNoteMap(p => ({ ...p, [photo.id]: e.target.value }))}
                      placeholder={t("photosNotePlaceholder")}
                      className="text-xs rounded-lg border border-gray-200 px-3 py-2 w-full placeholder:text-gray-300 focus:outline-none focus:border-green-400"
                    />
                  )}

                  {/* Actions */}
                  {tab === "PENDING" && (
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => handleAction(photo.id, "APPROVED")}
                        disabled={reviewMutation.isPending && actionId === photo.id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-semibold transition disabled:opacity-60"
                      >
                        {reviewMutation.isPending && actionId === photo.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <CheckCircle className="h-3.5 w-3.5" />}
                        {t("photosApprove")}
                      </button>
                      <button
                        onClick={() => handleAction(photo.id, "REJECTED")}
                        disabled={reviewMutation.isPending && actionId === photo.id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition disabled:opacity-60"
                      >
                        {reviewMutation.isPending && actionId === photo.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <XCircle className="h-3.5 w-3.5" />}
                        {t("photosReject")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
