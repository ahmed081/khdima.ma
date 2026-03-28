"use client"

import { Link, useRouter } from "@/i18n/navigation"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { registerRequest, selectAuthLoading, selectUser, selectAuthInitialized } from "@/store/slices/authSlice"
import { Wrench, Eye, EyeOff, CheckCircle, Users, Star, Shield, ArrowRight, UserCheck, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslations } from 'next-intl'

export default function RegisterPage() {
  const dispatch    = useDispatch()
  const router      = useRouter()
  const loading     = useSelector(selectAuthLoading)
  const user        = useSelector(selectUser)
  const initialized = useSelector(selectAuthInitialized)
  const t           = useTranslations('register')

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" })
  const [localError, setLocalError] = useState("")
  const [showPass, setShowPass]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (!initialized || !user) return
    router.replace('/')
  }, [user, initialized, router])

  if (initialized && user) return null

  const updateField = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")
    if (form.password !== form.confirm) {
      setLocalError(t('passwordMismatch'))
      return
    }
    dispatch(registerRequest({ name: form.name, email: form.email, phone: form.phone || undefined, password: form.password }))
  }

  const features = [
    { icon: CheckCircle, text: t('feature1') ?? "Accès instantané aux meilleurs pros" },
    { icon: Users,       text: t('feature2') ?? "Des milliers d'artisans vérifiés" },
    { icon: Star,        text: t('feature3') ?? "Avis et notes transparents" },
    { icon: Shield,      text: t('feature4') ?? "Gratuit pour les clients" },
  ]

  return (
    <div className="min-h-screen flex">
      {/* LEFT PANEL — illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 relative overflow-hidden flex-col justify-between p-12">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white/5 rounded-full" />
        </div>

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 group-hover:bg-white/30 transition-colors">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-extrabold text-white">
            khdimti<span className="text-green-200">.com</span>
          </span>
        </Link>

        {/* Main content */}
        <div className="relative space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              {t('heroTitle') ?? "Rejoignez des milliers de clients satisfaits"}
            </h1>
            <p className="mt-3 text-green-100 text-lg">
              {t('heroSubtitle') ?? "Créez votre compte gratuitement et trouvez le pro idéal"}
            </p>
          </div>

          <ul className="space-y-4">
            {features.map(({ icon: Icon, text }, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 flex-shrink-0">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-green-50 font-medium">{text}</span>
              </li>
            ))}
          </ul>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "15K+", label: t('statUsers') ?? "Clients" },
              { value: "4.8★", label: t('statRating') ?? "Note" },
              { value: "100%", label: t('statSafe') ?? "Gratuit" },
            ].map((s, i) => (
              <div key={i} className="text-center bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs text-green-200 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="relative text-green-200 text-sm">
          © 2025 khdimti.com — La plateforme marocaine de confiance
        </p>
      </div>

      {/* RIGHT PANEL — form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-16 bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 shadow-md">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-gray-900">
              khdimti<span className="text-green-600">.com</span>
            </span>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">{t('title')}</h2>
            <p className="mt-2 text-gray-500">{t('description')}</p>
          </div>

          {/* Account type selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-green-500 bg-green-50 cursor-default">
              <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-green-700">{t('typeClient')}</span>
              <span className="text-xs text-green-600 text-center">{t('typeClientDesc')}</span>
            </div>
            <Link href="/provider/register" className="group flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gray-200 group-hover:bg-amber-500 flex items-center justify-center transition-colors">
                <Briefcase className="h-5 w-5 text-gray-500 group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm font-semibold text-gray-600 group-hover:text-amber-700">{t('typeProvider')}</span>
              <span className="text-xs text-gray-400 group-hover:text-amber-600 text-center">{t('typeProviderDesc')}</span>
            </Link>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">{t('fullName')}</Label>
              <Input
                value={form.name}
                onChange={e => updateField("name", e.target.value)}
                required
                placeholder="Votre nom complet"
                className="h-11 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">{t('email')}</Label>
              <Input
                type="email"
                value={form.email}
                onChange={e => updateField("email", e.target.value)}
                required
                placeholder="email@exemple.com"
                className="h-11 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">{t('phone')}</Label>
              <Input
                type="tel"
                value={form.phone}
                onChange={e => updateField("phone", e.target.value)}
                placeholder="+212 6XX XXX XXX"
                className="h-11 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">{t('password')}</Label>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={e => updateField("password", e.target.value)}
                  required
                  placeholder=""
                  className="h-11 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500 pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute inset-y-0 end-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">{t('confirmPassword')}</Label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirm}
                  onChange={e => updateField("confirm", e.target.value)}
                  required
                  placeholder=""
                  className="h-11 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500 pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute inset-y-0 end-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {localError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                <span>⚠</span> {localError}
              </div>
            )}

            <Button
              className="w-full h-11 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold shadow-sm flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? t('loading') : (
                <>
                  {t('submit')}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-3 text-center text-sm text-gray-500">
            <p>
              {t('hasAccount')}{" "}
              <Link href="/login" className="font-semibold text-green-700 hover:text-green-600 hover:underline">
                {t('login')}
              </Link>
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">ou</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <p>
              {t('orRegisterAsPro')}{" "}
              <Link href="/provider/register" className="font-semibold text-green-700 hover:text-green-600 hover:underline">
                {t('registerAsPro')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
