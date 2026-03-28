"use client"

import { Link, useRouter } from "@/i18n/navigation"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { loginRequest, selectAuthLoading, selectUser, selectAuthInitialized } from "@/store/slices/authSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wrench, Eye, EyeOff, ArrowRight, Shield, Star, Users } from "lucide-react"
import { useTranslations } from "next-intl"

export default function LoginPage() {
  const dispatch    = useDispatch()
  const router      = useRouter()
  const loading     = useSelector(selectAuthLoading)
  const user        = useSelector(selectUser)
  const initialized = useSelector(selectAuthInitialized)
  const t           = useTranslations("login")

  const [email,       setEmail]       = useState("")
  const [password,    setPassword]    = useState("")
  const [showPass,    setShowPass]    = useState(false)
  const [rememberMe,  setRememberMe]  = useState(false)

  useEffect(() => {
    if (!initialized || !user) return
    if (user.role === "ADMIN")    { router.replace("/admin");              return }
    if (user.role === "PROVIDER") { router.replace("/provider/dashboard"); return }
    router.replace("/")
  }, [user, initialized, router])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    dispatch(loginRequest({ email, password }))
  }

  if (initialized && user) return null

  const stats = [
    { icon: Users,  value: "10k+", label: t("statUsers") },
    { icon: Star,   value: "4.9",  label: t("statRating") },
    { icon: Shield, value: "100%", label: t("statSafe") },
  ]

  return (
    <div className="min-h-screen flex">
      {/* LEFT — illustration panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 flex-col items-center justify-center p-12 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/3 right-0 w-48 h-48 rounded-full bg-emerald-400/20" />

        <div className="relative z-10 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center">
              <Wrench className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-extrabold text-white tracking-tight">khdimti.com</span>
          </div>

          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            {t("heroTitle")}
          </h2>
          <p className="text-green-100 text-lg mb-12 leading-relaxed max-w-md">
            {t("heroSubtitle")}
          </p>

          {/* Stats */}
          <div className="flex gap-8 justify-center">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center mx-auto mb-2">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-2xl font-extrabold text-white">{value}</p>
                <p className="text-green-200 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 bg-gray-50">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-gray-900">khdimti<span className="text-green-600">.com</span></span>
        </Link>

        <div className="w-full max-w-md">
          {/* Desktop back link */}
          <Link href="/" className="hidden lg:inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-8 transition-colors">
            ← {t("backHome")}
          </Link>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-extrabold text-gray-900">{t("title")}</h1>
              <p className="text-gray-500 mt-1 text-sm">{t("description")}</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">{t("email")}</Label>
                <Input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500/20"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">{t("password")}</Label>
                  <Link href="/forgot-password" className="text-xs text-green-600 hover:text-green-700 hover:underline">
                    {t("forgotPassword")}
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPass ? "text" : "password"}
                    placeholder={t("passwordPlaceholder")}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11 pe-11 border-gray-200 focus:border-green-500 focus:ring-green-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute inset-y-0 end-0 flex items-center px-3 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 accent-green-600 cursor-pointer"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                  {t("rememberMe")}
                </span>
              </label>

              {/* Submit */}
              <Button
                className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold shadow-sm text-sm"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("loading")}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {t("submit")}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 border-t border-gray-100" />
              <span className="text-xs text-gray-400">{t("or")}</span>
              <div className="flex-1 border-t border-gray-100" />
            </div>

            {/* Register link */}
            <p className="text-center text-sm text-gray-500">
              {t("noAccount")}{" "}
              <Link href="/register" className="text-green-600 hover:text-green-700 font-semibold hover:underline">
                {t("register")}
              </Link>
            </p>

            {/* Provider link */}
            <p className="text-center text-xs text-gray-400 mt-3">
              {t("orRegisterAsPro")}{" "}
              <Link href="/provider/register" className="text-green-600 hover:underline">
                {t("registerAsPro")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
