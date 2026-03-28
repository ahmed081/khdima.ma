"use client"

import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import {
  Mail, Phone, MapPin, MessageCircle, Send,
  Check, AlertCircle, Clock, ExternalLink,
  Facebook, Instagram, Linkedin,
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FormState {
  name: string; email: string; phone: string; subject: string; message: string
}

const INIT: FormState = { name: "", email: "", phone: "", subject: "", message: "" }

export default function ContactPage() {
  const locale = useLocale()
  const t      = useTranslations("contactPage")
  const isRTL  = locale === "ar"

  const [form,      setForm]      = useState<FormState>(INIT)
  const [sending,   setSending]   = useState(false)
  const [sent,      setSent]      = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Fetch contact info from DB (admin-managed)
  const { data: contactInfo = {} } = useQuery<Record<string, string>>({
    queryKey: ["contact-info"],
    queryFn: () => fetch("/api/contact").then(r => r.json()),
  })

  // Fallback values if DB keys aren't set yet
  const info = {
    phone:   contactInfo["CONTACT_PHONE"]   || "+212 6 00 00 00 00",
    email:   contactInfo["CONTACT_EMAIL"]   || "contact@khdimti.com",
    address: contactInfo["CONTACT_ADDRESS"] || t("defaultAddress"),
    whatsapp:  contactInfo["CONTACT_WHATSAPP"]  || "",
    facebook:  contactInfo["CONTACT_FACEBOOK"]  || "",
    instagram: contactInfo["CONTACT_INSTAGRAM"] || "",
    linkedin:  contactInfo["CONTACT_LINKEDIN"]  || "",
    hours:     contactInfo["CONTACT_HOURS"]     || t("defaultHours"),
  }

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setFormError(t("formRequired"))
      return
    }
    setSending(true)
    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      setSent(true)
      setForm(INIT)
    } catch (err: any) {
      setFormError(err.message ?? t("formError"))
    } finally {
      setSending(false)
    }
  }

  const contactItems = [
    { icon: Phone,         label: t("phone"),   value: info.phone,   href: `tel:${info.phone}` },
    { icon: Mail,          label: t("email"),   value: info.email,   href: `mailto:${info.email}` },
    { icon: MessageCircle, label: "WhatsApp",   value: info.whatsapp || info.phone, href: `https://wa.me/${(info.whatsapp || info.phone).replace(/\D/g,"")}` },
    { icon: MapPin,        label: t("address"), value: info.address, href: null },
  ]

  const socials = [
    { icon: Facebook,  href: info.facebook,  show: !!info.facebook },
    { icon: Instagram, href: info.instagram, show: !!info.instagram },
    { icon: Linkedin,  href: info.linkedin,  show: !!info.linkedin },
  ].filter(s => s.show)

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-700 to-emerald-600 text-white py-14 px-4 text-center relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative">
          <h1 className="text-4xl font-extrabold mb-2">{t("title")}</h1>
          <p className="text-green-100 text-lg max-w-md mx-auto">{t("subtitle")}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* LEFT — contact info */}
          <div className="lg:col-span-2 space-y-4">

            {/* Contact details card */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="w-1 h-5 bg-green-600 rounded-full inline-block" />
                {t("contactDetails")}
              </h2>
              <div className="space-y-4">
                {contactItems.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-green-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">{label}</p>
                      {href ? (
                        <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                          className="text-sm font-medium text-gray-800 hover:text-green-700 transition-colors flex items-center gap-1">
                          {value}
                          {href.startsWith("http") && <ExternalLink className="h-3 w-3 opacity-50" />}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-gray-800">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hours */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{t("hours")}</p>
                  <p className="text-sm font-medium text-gray-800">{info.hours}</p>
                </div>
              </div>
            </div>

            {/* Social links */}
            {socials.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">{t("followUs")}</p>
                <div className="flex gap-3">
                  {socials.map(({ icon: Icon, href }, i) => (
                    <a key={i} href={href!} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-green-50 hover:text-green-700 transition-colors border border-gray-100">
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* CTA for providers */}
            <div className="bg-gradient-to-br from-green-700 to-emerald-600 rounded-2xl p-5 text-white">
              <h3 className="font-bold mb-2">{t("forProviders")}</h3>
              <p className="text-green-100 text-sm mb-3">{t("forProvidersDesc")}</p>
              <Link href="/provider/register"
                className="inline-block bg-white text-green-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-green-50 transition-colors">
                {t("forProvidersCta")}
              </Link>
            </div>
          </div>

          {/* RIGHT — contact form */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
              <h2 className="font-bold text-gray-900 text-xl mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-green-600 rounded-full inline-block" />
                {t("sendMessage")}
              </h2>

              {sent ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{t("sentTitle")}</h3>
                  <p className="text-gray-500 text-sm mb-6">{t("sentDesc")}</p>
                  <Button onClick={() => setSent(false)} variant="outline">
                    {t("sendAnother")}
                  </Button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">{t("name")} *</Label>
                      <Input
                        value={form.name}
                        onChange={set("name")}
                        placeholder={t("namePlaceholder")}
                        required
                        className="h-10 border-gray-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">{t("emailField")} *</Label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={set("email")}
                        placeholder="email@example.com"
                        required
                        className="h-10 border-gray-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">{t("phoneField")}</Label>
                      <Input
                        type="tel"
                        value={form.phone}
                        onChange={set("phone")}
                        placeholder="+212 6XX XXX XXX"
                        className="h-10 border-gray-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">{t("subject")}</Label>
                      <Input
                        value={form.subject}
                        onChange={set("subject")}
                        placeholder={t("subjectPlaceholder")}
                        className="h-10 border-gray-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">{t("message")} *</Label>
                    <textarea
                      value={form.message}
                      onChange={set("message") as any}
                      placeholder={t("messagePlaceholder")}
                      required
                      rows={5}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
                    />
                  </div>

                  {formError && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {formError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={sending}
                    className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold gap-2"
                  >
                    {sending ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t("sending")}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {t("sendBtn")}
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
