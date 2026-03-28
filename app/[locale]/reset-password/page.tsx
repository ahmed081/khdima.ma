"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Link, useRouter } from "@/i18n/navigation"
import { useLocale } from "next-intl"
import { Wrench, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token        = searchParams.get("token") ?? ""
  const locale       = useLocale()
  const router       = useRouter()
  const isRtl        = locale === "ar"

  const [password,    setPassword]    = useState("")
  const [confirm,     setConfirm]     = useState("")
  const [showPass,    setShowPass]    = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [validating,  setValidating]  = useState(true)
  const [tokenValid,  setTokenValid]  = useState(false)
  const [done,        setDone]        = useState(false)
  const [error,       setError]       = useState("")

  const ui = {
    title:      locale === "ar" ? "إعادة تعيين كلمة المرور" : locale === "fr" ? "Nouveau mot de passe" : "Reset your password",
    subtitle:   locale === "ar" ? "أدخل كلمة المرور الجديدة" : locale === "fr" ? "Choisissez votre nouveau mot de passe" : "Enter your new password",
    passLabel:  locale === "ar" ? "كلمة المرور الجديدة" : locale === "fr" ? "Nouveau mot de passe" : "New password",
    confirmLabel: locale === "ar" ? "تأكيد كلمة المرور" : locale === "fr" ? "Confirmer le mot de passe" : "Confirm password",
    submitBtn:  locale === "ar" ? "تعيين كلمة المرور" : locale === "fr" ? "Enregistrer" : "Set password",
    submitting: locale === "ar" ? "جارٍ الحفظ..." : locale === "fr" ? "Enregistrement..." : "Saving...",
    mismatch:   locale === "ar" ? "كلمتا المرور غير متطابقتين" : locale === "fr" ? "Les mots de passe ne correspondent pas" : "Passwords do not match",
    tooShort:   locale === "ar" ? "8 أحرف على الأقل" : locale === "fr" ? "8 caractères minimum" : "At least 8 characters",
    invalidToken: locale === "ar" ? "رابط إعادة التعيين غير صالح أو منتهي الصلاحية" : locale === "fr" ? "Ce lien de réinitialisation est invalide ou expiré" : "This reset link is invalid or has expired",
    doneTitle:  locale === "ar" ? "تم تغيير كلمة المرور!" : locale === "fr" ? "Mot de passe modifié !" : "Password changed!",
    doneText:   locale === "ar" ? "يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة." : locale === "fr" ? "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe." : "You can now log in with your new password.",
    loginBtn:   locale === "ar" ? "تسجيل الدخول" : locale === "fr" ? "Se connecter" : "Sign in",
    requestNew: locale === "ar" ? "طلب رابط جديد" : locale === "fr" ? "Demander un nouveau lien" : "Request a new link",
  }

  useEffect(() => {
    if (!token) { setValidating(false); setTokenValid(false); return }
    fetch(`/api/auth/reset-password?token=${token}`)
      .then(r => r.json())
      .then(data => { setTokenValid(data.valid); setValidating(false) })
      .catch(() => { setTokenValid(false); setValidating(false) })
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password.length < 8) { setError(ui.tooShort); return }
    if (password !== confirm) { setError(ui.mismatch); return }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Error"); return }
      setDone(true)
      setTimeout(() => router.replace("/login"), 3000)
    } catch {
      setError(locale === "ar" ? "خطأ في الاتصال" : locale === "fr" ? "Erreur réseau" : "Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4" dir={isRtl ? "rtl" : "ltr"}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 shadow-lg">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-extrabold text-gray-900">
              khdimti<span className="text-green-600">.com</span>
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {validating ? (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="h-8 w-8 text-green-600 animate-spin mb-3" />
              <p className="text-gray-500 text-sm">
                {locale === "ar" ? "جارٍ التحقق..." : locale === "fr" ? "Vérification..." : "Verifying..."}
              </p>
            </div>
          ) : !tokenValid ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-7 w-7 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">{ui.invalidToken}</h2>
              <Link
                href="/forgot-password"
                className="inline-flex items-center gap-1.5 mt-4 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                {ui.requestNew}
              </Link>
            </div>
          ) : done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{ui.doneTitle}</h2>
              <p className="text-gray-500 text-sm mb-5">{ui.doneText}</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                {ui.loginBtn}
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-7">
                <h1 className="text-2xl font-extrabold text-gray-900">{ui.title}</h1>
                <p className="text-gray-500 text-sm mt-1">{ui.subtitle}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">{ui.passLabel}</Label>
                  <div className="relative">
                    <Input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder=""
                      className="h-11 pe-11 border-gray-200 focus:border-green-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      className="absolute inset-y-0 end-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">{ui.confirmLabel}</Label>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      required
                      placeholder=""
                      className="h-11 pe-11 border-gray-200 focus:border-green-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute inset-y-0 end-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold shadow-sm"
                >
                  {loading ? ui.submitting : ui.submitBtn}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
