"use client"

import { useEffect, useRef, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useRouter, Link } from "@/i18n/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { selectUser, setUser, selectAuthInitialized } from "@/store/slices/authSlice"
import { Input }    from "@/components/ui/input"
import { Label }    from "@/components/ui/label"
import { Button }   from "@/components/ui/button"
import { useTranslations, useLocale } from "next-intl"
import {
  User, Mail, Phone, Lock, Eye, EyeOff, Camera, Check,
  AlertCircle, ArrowRight, Briefcase, ChevronRight,
} from "lucide-react"

type Tab = "info" | "security"

export default function ProfilePage() {
  const user        = useSelector(selectUser)
  const initialized = useSelector(selectAuthInitialized)
  const router      = useRouter()
  const dispatch    = useDispatch()
  const locale      = useLocale()
  const t           = useTranslations("profile")
  const fileRef     = useRef<HTMLInputElement>(null)

  const [tab,         setTab]         = useState<Tab>("info")
  const [name,        setName]        = useState("")
  const [phone,       setPhone]       = useState("")
  const [oldPass,     setOldPass]     = useState("")
  const [newPass,     setNewPass]     = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  const [showOld,     setShowOld]     = useState(false)
  const [showNew,     setShowNew]     = useState(false)
  const [success,     setSuccess]     = useState<string | null>(null)
  const [error,       setError]       = useState<string | null>(null)
  const [avatarUrl,   setAvatarUrl]   = useState<string>("")
  const [uploading,   setUploading]   = useState(false)

  useEffect(() => {
    if (initialized && user === null) router.push("/login")
    if (user) {
      setName(user.name ?? "")
      setPhone(user.phone ?? "")
      setAvatarUrl(user.avatarUrl ?? "")
    }
  }, [initialized, user, router])

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res  = await fetch("/api/auth/me", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Update failed")
      return data
    },
    onSuccess: (updated) => {
      dispatch(setUser(updated))
      setSuccess(t("savedSuccess"))
      setOldPass(""); setNewPass(""); setConfirmPass("")
      setTimeout(() => setSuccess(null), 3000)
    },
    onError: (err: any) => {
      setError(err.message)
      setTimeout(() => setError(null), 4000)
    },
  })

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res  = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAvatarUrl(data.url)
      // persist immediately
      const patchRes  = await fetch("/api/auth/me", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ avatarUrl: data.url }),
      })
      const patchData = await patchRes.json()
      if (patchRes.ok) dispatch(setUser(patchData))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  function saveInfo(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    updateMutation.mutate({ name, phone: phone || undefined })
  }

  function savePassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (newPass !== confirmPass) { setError(t("passwordMismatch")); return }
    if (newPass.length < 6)      { setError(t("passwordTooShort")); return }
    updateMutation.mutate({ password: newPass })
  }

  if (!initialized || !user) return null

  const firstName = user.name?.split(" ")[0] ?? ""

  const tabs: { key: Tab; label: string }[] = [
    { key: "info",     label: t("tabInfo") },
    { key: "security", label: t("tabSecurity") },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero banner */}
      <div className="bg-gradient-to-br from-green-700 via-green-600 to-emerald-600 overflow-hidden relative">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        <div className="container mx-auto px-4 max-w-2xl py-10 relative">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-3 border-white/30 shadow-xl bg-white/10">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-extrabold text-white/80">
                    {firstName[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -end-1 w-7 h-7 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-50 transition-colors border border-gray-200"
              >
                {uploading
                  ? <span className="w-3 h-3 border border-green-500/30 border-t-green-500 rounded-full animate-spin" />
                  : <Camera className="h-3.5 w-3.5 text-green-700" />
                }
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-white">{user.name}</h1>
              <p className="text-green-200 text-sm">{user.email}</p>
              <span className="mt-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-white">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <div className="h-6 bg-gray-50" style={{ clipPath: "ellipse(100% 100% at 50% 100%)" }} />
      </div>

      <div className="container mx-auto px-4 max-w-2xl -mt-2 pb-16">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
          {tabs.map(tb => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === tb.key
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>

        {/* Feedback banners */}
        {success && (
          <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
            <Check className="h-4 w-4 flex-shrink-0" />
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Tab: Info */}
        {tab === "info" && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-5">{t("personalInfo")}</h2>
            <form onSubmit={saveInfo} className="space-y-5">
              {/* Email (read-only) */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">{t("email")}</Label>
                <div className="flex items-center gap-2 h-10 px-3 rounded-lg bg-gray-50 border border-gray-200">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{user.email}</span>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">{t("fullName")}</Label>
                <div className="relative">
                  <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="ps-9 h-10 border-gray-200"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={t("fullNamePlaceholder")}
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">{t("phone")}</Label>
                <div className="relative">
                  <Phone className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="tel"
                    className="ps-9 h-10 border-gray-200"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+212 6XX XXX XXX"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full h-10 bg-green-700 hover:bg-green-600 text-white font-semibold"
              >
                {updateMutation.isPending
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : t("save")
                }
              </Button>
            </form>

            {/* Provider switch CTA */}
            {user.role === "CUSTOMER" && (
              <div className="mt-6 pt-5 border-t border-gray-100">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                  <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-4 w-4 text-green-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">{t("becomeProvider")}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t("becomeProviderDesc")}</p>
                    <Button variant="link" size="sm" className="p-0 h-auto mt-1 text-green-700 text-xs" asChild>
                      <Link href="/provider/register">
                        {t("becomeProviderCta")} <ChevronRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Provider dashboard link */}
            {user.role === "PROVIDER" && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/provider/dashboard">
                    <Briefcase className="h-4 w-4 me-2" />
                    {t("providerDashboard")}
                    <ArrowRight className="h-4 w-4 ms-auto" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Tab: Security */}
        {tab === "security" && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-5">{t("changePassword")}</h2>
            <form onSubmit={savePassword} className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">{t("newPassword")}</Label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={showNew ? "text" : "password"}
                    className="ps-9 pe-10 h-10 border-gray-200"
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                    placeholder=""
                    minLength={6}
                    required
                  />
                  <button type="button" onClick={() => setShowNew(v => !v)} className="absolute inset-y-0 end-0 px-3 flex items-center text-gray-400 hover:text-gray-600">
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">{t("confirmPassword")}</Label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={showOld ? "text" : "password"}
                    className="ps-9 pe-10 h-10 border-gray-200"
                    value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                    placeholder=""
                    minLength={6}
                    required
                  />
                  <button type="button" onClick={() => setShowOld(v => !v)} className="absolute inset-y-0 end-0 px-3 flex items-center text-gray-400 hover:text-gray-600">
                    {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full h-10 bg-green-700 hover:bg-green-600 text-white font-semibold"
              >
                {updateMutation.isPending
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : t("updatePassword")
                }
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
