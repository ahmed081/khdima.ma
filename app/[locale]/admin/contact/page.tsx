"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import {
  Phone, Mail, MapPin, MessageCircle, Clock, Globe,
  Save, Check, AlertCircle, Eye, Trash2, RefreshCw,
  Facebook, Instagram, Linkedin, ChevronDown, ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Submission = { name: string; email: string; phone?: string; subject?: string; message: string; createdAt: string }

function SubmissionRow({ sub, paramKey, onDelete }: { sub: Submission; paramKey: string; onDelete: (k: string) => void }) {
  const t = useTranslations("admin")
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700 text-sm flex-shrink-0">
            {sub.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900">{sub.name}</p>
            <p className="text-xs text-gray-400 truncate">{sub.email} · {sub.subject || t("noSubject")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 ms-4 flex-shrink-0">
          <span className="text-xs text-gray-400 hidden sm:block">
            {new Date(sub.createdAt).toLocaleDateString("fr-MA", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
          <button
            onClick={e => { e.stopPropagation(); onDelete(paramKey) }}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </div>
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-50 bg-gray-50/30">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-sm mb-3">
            <div><span className="text-gray-400 text-xs">{t("fieldPhone")}</span><p className="font-medium text-gray-800">{sub.phone || "—"}</p></div>
            <div><span className="text-gray-400 text-xs">{t("fieldSubject")}</span><p className="font-medium text-gray-800">{sub.subject || "—"}</p></div>
            <div><span className="text-gray-400 text-xs">{t("fieldDate")}</span><p className="font-medium text-gray-800">{new Date(sub.createdAt).toLocaleString("fr-MA")}</p></div>
          </div>
          <div>
            <span className="text-gray-400 text-xs">{t("fieldMessage")}</span>
            <p className="text-gray-800 text-sm mt-1 bg-white rounded-lg p-3 border border-gray-100 leading-relaxed">{sub.message}</p>
          </div>
          <div className="flex gap-2 mt-3">
            <a href={`mailto:${sub.email}?subject=Re: ${sub.subject || "Your message"}`}
              className="flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 transition-colors">
              <Mail className="h-3 w-3" /> {t("replyByEmail")}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

async function fetchParams(): Promise<Record<string, string>> {
  const res = await fetch("/api/admin/contact-params")
  return res.ok ? res.json() : {}
}

async function fetchSubmissions(): Promise<{ key: string; value: string }[]> {
  const res = await fetch("/api/admin/contact-submissions")
  return res.ok ? res.json() : []
}

export default function AdminContactPage() {
  const t = useTranslations("admin")
  const qc = useQueryClient()

  const CONTACT_KEYS = [
    { key: "CONTACT_PHONE",     icon: Phone,         label: t("contactKeyPhone") },
    { key: "CONTACT_EMAIL",     icon: Mail,          label: t("contactKeyEmail") },
    { key: "CONTACT_WHATSAPP",  icon: MessageCircle, label: t("contactKeyWhatsApp") },
    { key: "CONTACT_ADDRESS",   icon: MapPin,        label: t("contactKeyAddress") },
    { key: "CONTACT_HOURS",     icon: Clock,         label: t("contactKeyHours") },
    { key: "CONTACT_FACEBOOK",  icon: Facebook,      label: t("contactKeyFacebook") },
    { key: "CONTACT_INSTAGRAM", icon: Instagram,     label: t("contactKeyInstagram") },
    { key: "CONTACT_LINKEDIN",  icon: Linkedin,      label: t("contactKeyLinkedIn") },
    { key: "CONTACT_WEBSITE",   icon: Globe,         label: t("contactKeyWebsite") },
  ]

  const [values,  setValues]  = useState<Record<string, string>>({})
  const [loaded,  setLoaded]  = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const { data: params = {}, isLoading: paramsLoading } = useQuery({
    queryKey: ["admin-contact-params"],
    queryFn: fetchParams,
    onSuccess: (data: Record<string, string>) => {
      if (!loaded) { setValues(data); setLoaded(true) }
    },
  } as any)

  const { data: rawSubs = [], refetch: refetchSubs, isLoading: subsLoading } = useQuery({
    queryKey: ["admin-contact-submissions"],
    queryFn: fetchSubmissions,
  })

  const submissions = rawSubs
    .filter((p: any) => p.key.startsWith("CONTACT_SUBMISSION_"))
    .map((p: any) => {
      try { return { key: p.key, data: JSON.parse(p.value) as Submission } }
      catch { return null }
    })
    .filter(Boolean)
    .sort((a: any, b: any) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime())

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/contact-params", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(values),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
    },
    onSuccess: () => {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      qc.invalidateQueries({ queryKey: ["contact-info"] })
    },
    onError: (err: any) => setError(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (key: string) => {
      const res = await fetch("/api/admin/contact-submissions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      })
      if (!res.ok) throw new Error("Delete failed")
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-contact-submissions"] }),
  })

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-gray-800 text-white px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Phone className="h-4 w-4" />
            </div>
            <span className="text-xs text-white/50 uppercase tracking-widest">Admin</span>
          </div>
          <h1 className="text-2xl font-extrabold">Contact Management</h1>
          <p className="text-white/50 text-sm mt-1">Edit site contact info · View form submissions</p>
        </div>
        <div className="h-6 bg-slate-50 mt-6" style={{ clipPath: "ellipse(100% 100% at 50% 100%)" }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-2 space-y-8">

        {/* Contact info editor */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Site Contact Info</h2>
            <span className="text-xs text-gray-400">Changes appear on the public contact page</span>
          </div>

          {paramsLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({length: 5}).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CONTACT_KEYS.map(({ key, icon: Icon, label }) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </Label>
                  <Input
                    value={values[key] ?? ""}
                    onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                    placeholder={`Enter ${label.toLowerCase()}...`}
                    className="h-9 text-sm border-gray-200"
                  />
                </div>
              ))}
            </div>
          )}

          {(success || error) && (
            <div className={`mx-6 mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
              success ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"
            }`}>
              {success ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {success ? "Changes saved successfully!" : error}
            </div>
          )}

          <div className="px-6 pb-6">
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="bg-green-700 hover:bg-green-600 text-white gap-2"
            >
              {saveMutation.isPending
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Save className="h-4 w-4" />
              }
              Save Changes
            </Button>
          </div>
        </div>

        {/* Submissions */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-gray-400" />
              <h2 className="font-bold text-gray-900">Contact Form Submissions</h2>
              {submissions.length > 0 && (
                <span className="ml-2 bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {submissions.length}
                </span>
              )}
            </div>
            <button onClick={() => refetchSubs()} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>

          {subsLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({length: 3}).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-gray-400">
              <MessageCircle className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm">No submissions yet</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {submissions.map((s: any) => (
                <SubmissionRow
                  key={s.key}
                  sub={s.data}
                  paramKey={s.key}
                  onDelete={key => deleteMutation.mutate(key)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
