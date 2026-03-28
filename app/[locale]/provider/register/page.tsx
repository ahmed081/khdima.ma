"use client"

import { Link, useRouter } from "@/i18n/navigation"
import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { selectUser, selectAuthInitialized, setUser } from "@/store/slices/authSlice"
import { useMutation } from "@tanstack/react-query"
import { Wrench, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle, TrendingUp, Clock, BadgeCheck, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLocale, useTranslations } from 'next-intl'
import { CityCombobox } from "@/components/city-combobox"
import { CategoryCombobox } from "@/components/category-combobox"

export default function ProviderRegisterPage() {
  const router      = useRouter()
  const locale      = useLocale()
  const isRtl       = locale === 'ar'
  const tpr         = useTranslations("providerRegister")
  const dispatch    = useDispatch()
  const user        = useSelector(selectUser)
  const initialized = useSelector(selectAuthInitialized)

  // PROVIDER → redirect to dashboard
  useEffect(() => {
    if (!initialized) return
    if (user?.role === "PROVIDER") router.replace("/provider/dashboard")
  }, [user, initialized, router])

  // For CLIENT users: start directly at business info step
  const isClient = user?.role === "CUSTOMER"

  const [step, setStep]             = useState(1)
  const [localError, setLocalError] = useState("")
  const [showPass, setShowPass]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm]             = useState({
    name: "", email: "", password: "", confirm: "",
    businessName: "", phone: "", whatsapp: "",
    cityId: "", categoryId: "", yearsExperience: "", bio: "",
  })

  const set = (key: string, value: string) => setForm(p => ({ ...p, [key]: value }))

  // Client users call become-provider; guests call provider-register
  const registerMutation = useMutation({
    mutationFn: async () => {
      if (isClient) {
        const res = await fetch("/api/auth/become-provider", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessName:    form.businessName,
            phone:           form.phone,
            whatsapp:        form.whatsapp || undefined,
            cityId:          parseInt(form.cityId),
            categoryId:      parseInt(form.categoryId),
            yearsExperience: form.yearsExperience ? parseInt(form.yearsExperience) : undefined,
            bio:             form.bio || undefined,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Error")
        return data
      } else {
        const res = await fetch("/api/auth/provider-register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name:            form.name,
            email:           form.email,
            password:        form.password,
            businessName:    form.businessName,
            phone:           form.phone,
            whatsapp:        form.whatsapp || undefined,
            cityId:          parseInt(form.cityId),
            categoryId:      parseInt(form.categoryId),
            yearsExperience: form.yearsExperience ? parseInt(form.yearsExperience) : undefined,
            bio:             form.bio || undefined,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Registration failed")
        return data
      }
    },
    onSuccess: (data: any) => {
      if (data?.user) dispatch(setUser(data.user))
      router.push('/provider/dashboard')
    },
    onError:   (err: any) => setLocalError(err.message),
  })

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")
    if (form.password !== form.confirm) { setLocalError(tpr("passwordsNoMatch")); return }
    setStep(2)
  }

  const benefits = [
    { icon: TrendingUp,  text: tpr("benefit1") },
    { icon: BadgeCheck,  text: tpr("benefit2") },
    { icon: Clock,       text: tpr("benefit3") },
    { icon: CheckCircle, text: tpr("benefit4") },
  ]

  // Wait for auth to initialize before rendering
  if (!initialized) return null

  return (
    <div className="min-h-screen flex" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-green-700 via-emerald-600 to-teal-600 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-white/10 rounded-full" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/10 rounded-full" />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-white/5 rounded-full" />
        </div>

        <Link href="/" className="relative flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 group-hover:bg-white/30 transition-colors">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-extrabold text-white">
            khdimti<span className="text-green-200">.com</span>
          </span>
        </Link>

        <div className="relative space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-semibold mb-4">
              <Wrench className="h-3.5 w-3.5" />
              {tpr("forProfessionals")}
            </div>
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              {tpr("title")}
            </h1>
            <p className="mt-3 text-green-100 text-lg">{tpr("subtitle")}</p>
          </div>

          <ul className="space-y-4">
            {benefits.map(({ icon: Icon, text }, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 flex-shrink-0">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-green-50 font-medium">{text}</span>
              </li>
            ))}
          </ul>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <p className="text-white/80 text-sm leading-relaxed">
              ⚡ {tpr("pendingNotice")}
            </p>
          </div>
        </div>

        <p className="relative text-green-200 text-sm">
          © 2025 khdimti.com
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-14 bg-white overflow-y-auto">
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
          {/* Header */}
          <div className="mb-8">
            {isClient && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                <Briefcase className="h-4 w-4 flex-shrink-0" />
                {tpr("loggedInAsClient")}
              </div>
            )}
            <h2 className="text-3xl font-extrabold text-gray-900">{tpr("title")}</h2>
            <p className="mt-1 text-gray-500">{tpr("subtitle")}</p>
          </div>

          {/* Step indicator — only for guests */}
          {!isClient && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                {[1, 2].map(s => (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${
                      step > s ? 'bg-green-600 text-white' :
                      step === s ? 'bg-green-600 text-white ring-4 ring-green-100' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {step > s ? <CheckCircle className="h-4 w-4" /> : s}
                    </div>
                    <span className={`text-sm font-medium ${step >= s ? 'text-gray-800' : 'text-gray-400'}`}>
                      {s === 1 ? tpr("step1") : tpr("step2")}
                    </span>
                    {s < 2 && <div className={`flex-1 h-0.5 rounded ${step > s ? 'bg-green-600' : 'bg-gray-200'}`} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Account info — guests only */}
          {!isClient && step === 1 && (
            <form className="space-y-5" onSubmit={handleStep1}>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">{tpr("fullName")}</Label>
                <Input
                  value={form.name}
                  onChange={e => set("name", e.target.value)}
                  required
                  placeholder={tpr("fullName")}
                  className="h-11 rounded-xl border-gray-200 focus:border-green-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">{tpr("email")}</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={e => set("email", e.target.value)}
                  required
                  placeholder="email@exemple.com"
                  className="h-11 rounded-xl border-gray-200 focus:border-green-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">{tpr("password")}</Label>
                <div className="relative">
                  <Input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={e => set("password", e.target.value)}
                    required
                    minLength={8}
                    placeholder=""
                    className="h-11 rounded-xl border-gray-200 focus:border-green-500 pe-10"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute inset-y-0 end-0 flex items-center px-3 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">{tpr("confirmPassword")}</Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    value={form.confirm}
                    onChange={e => set("confirm", e.target.value)}
                    required
                    placeholder=""
                    className="h-11 rounded-xl border-gray-200 focus:border-green-500 pe-10"
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute inset-y-0 end-0 flex items-center px-3 text-gray-400 hover:text-gray-600">
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
                type="submit"
              >
                {tpr("next")}
                {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>
          )}

          {/* Step 2: Business info — clients start here, guests come from step 1 */}
          {(isClient || step === 2) && (
            <form className="space-y-5" onSubmit={e => { e.preventDefault(); setLocalError(""); registerMutation.mutate() }}>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">{tpr("businessName")}</Label>
                <Input
                  value={form.businessName}
                  onChange={e => set("businessName", e.target.value)}
                  required
                  placeholder={tpr("businessName")}
                  className="h-11 rounded-xl border-gray-200 focus:border-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">{tpr("phone")}</Label>
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={e => set("phone", e.target.value)}
                    required
                    placeholder="+212 6XX"
                    className="h-11 rounded-xl border-gray-200 focus:border-green-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">{tpr("whatsapp")}</Label>
                  <Input
                    type="tel"
                    value={form.whatsapp}
                    onChange={e => set("whatsapp", e.target.value)}
                    placeholder="+212 6XX"
                    className="h-11 rounded-xl border-gray-200 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">{tpr("city")}</Label>
                  <CityCombobox
                    value={form.cityId}
                    onChange={v => set("cityId", v)}
                    required
                    placeholder={tpr("selectCity")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">{tpr("experience")}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={form.yearsExperience}
                    onChange={e => set("yearsExperience", e.target.value)}
                    placeholder="0"
                    className="h-11 rounded-xl border-gray-200 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">{tpr("category")}</Label>
                <CategoryCombobox
                  value={form.categoryId}
                  onChange={v => set("categoryId", v)}
                  required
                  placeholder={tpr("selectCategory")}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">{tpr("bio")}</Label>
                <Textarea
                  value={form.bio}
                  onChange={e => set("bio", e.target.value)}
                  rows={3}
                  placeholder={tpr("bioPlaceholder")}
                  className="rounded-xl border-gray-200 focus:border-green-500 resize-none"
                />
              </div>

              {localError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                  <span>⚠</span> {localError}
                </div>
              )}

              <div className="flex gap-3">
                {!isClient && (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11 rounded-xl border-gray-200 flex items-center justify-center gap-2"
                    onClick={() => setStep(1)}
                  >
                    {isRtl ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                    {tpr("back")}
                  </Button>
                )}
                <Button
                  className={`h-11 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold shadow-sm ${isClient ? "w-full" : "flex-1"}`}
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? tpr("registering") : tpr("register")}
                </Button>
              </div>
            </form>
          )}

          {/* Footer links */}
          <div className="mt-6 text-center text-sm text-gray-500 space-y-2">
            {isClient ? (
              <p>
                <Link href="/client/dashboard" className="font-medium text-gray-400 hover:text-gray-600 hover:underline text-xs">
                  ← {tpr("backToDashboard")}
                </Link>
              </p>
            ) : (
              <>
                <p>
                  {tpr("hasAccount")}{" "}
                  <Link href="/login" className="font-semibold text-green-700 hover:text-green-600 hover:underline">
                    {tpr("loginLink")}
                  </Link>
                </p>
                <p>
                  <Link href="/register" className="font-medium text-gray-400 hover:text-gray-600 hover:underline text-xs">
                    {tpr("clientRegister")}
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
