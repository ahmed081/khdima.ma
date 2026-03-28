"use client"

import { useState } from "react"
import { Link } from "@/i18n/navigation"
import { useLocale } from "next-intl"
import { Wrench, Mail, ArrowRight, CheckCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const locale = useLocale()
  const isRtl  = locale === "ar"

  const [email,   setEmail]   = useState("")
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState("")

  const ui = {
    title:       locale === "ar" ? "نسيت كلمة المرور؟" : locale === "fr" ? "Mot de passe oublié ?" : "Forgot password?",
    subtitle:    locale === "ar" ? "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين" : locale === "fr" ? "Saisissez votre email et nous vous enverrons un lien de réinitialisation" : "Enter your email and we'll send you a reset link",
    emailLabel:  locale === "ar" ? "البريد الإلكتروني" : locale === "fr" ? "Email" : "Email",
    sendBtn:     locale === "ar" ? "إرسال الرابط" : locale === "fr" ? "Envoyer le lien" : "Send reset link",
    sending:     locale === "ar" ? "جارٍ الإرسال..." : locale === "fr" ? "Envoi en cours..." : "Sending...",
    backToLogin: locale === "ar" ? "العودة إلى تسجيل الدخول" : locale === "fr" ? "Retour à la connexion" : "Back to login",
    successTitle:locale === "ar" ? "تم الإرسال!" : locale === "fr" ? "Email envoyé !" : "Email sent!",
    successText: locale === "ar" ? "إذا كان هذا البريد الإلكتروني مسجلاً، ستتلقى رابط إعادة التعيين خلال دقائق. تحقق من صندوق الوارد والبريد العشوائي." : locale === "fr" ? "Si cet email est bien enregistré, vous recevrez un lien de réinitialisation dans quelques minutes. Vérifiez vos spams si nécessaire." : "If this email is registered, you'll receive a reset link shortly. Check your spam folder if needed.",
    checkSpam:   locale === "ar" ? "لم يصلك الرابط؟" : locale === "fr" ? "Vous n'avez pas reçu l'email ?" : "Didn't receive the email?",
    resend:      locale === "ar" ? "إعادة الإرسال" : locale === "fr" ? "Renvoyer" : "Resend",
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "An error occurred")
      } else {
        setSent(true)
      }
    } catch {
      setError(locale === "ar" ? "خطأ في الاتصال" : locale === "fr" ? "Erreur de connexion" : "Connection error")
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
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 shadow-lg group-hover:shadow-green-500/30 transition-shadow">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-extrabold text-gray-900">
              khdimti<span className="text-green-600">.com</span>
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {!sent ? (
            <>
              <div className="text-center mb-7">
                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-7 w-7 text-green-600" />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900">{ui.title}</h1>
                <p className="text-gray-500 text-sm mt-2">{ui.subtitle}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">{ui.emailLabel}</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="email@exemple.com"
                    className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500/20"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold shadow-sm flex items-center justify-center gap-2"
                >
                  {loading ? ui.sending : (
                    <>
                      {ui.sendBtn}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{ui.successTitle}</h2>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">{ui.successText}</p>
              <p className="text-xs text-gray-400 mb-3">{ui.checkSpam}</p>
              <button
                onClick={() => { setSent(false); setEmail("") }}
                className="text-sm text-green-700 hover:text-green-600 font-medium hover:underline"
              >
                {ui.resend}
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {ui.backToLogin}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
