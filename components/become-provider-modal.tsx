"use client"

import { useState } from "react"
import { useLocale } from "next-intl"
import { useDispatch, useSelector } from "react-redux"
import { setUser, selectUser } from "@/store/slices/authSlice"
import { useMutation } from "@tanstack/react-query"
import { X, Briefcase, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CityCombobox } from "@/components/city-combobox"
import { CategoryCombobox } from "@/components/category-combobox"

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export function BecomeProviderModal({ onClose, onSuccess }: Props) {
  const locale   = useLocale()
  const isRtl    = locale === "ar"
  const dispatch = useDispatch()
  const currentUser = useSelector(selectUser)

  const [form, setForm] = useState({
    businessName: "", phone: "", whatsapp: "",
    cityId: "", categoryId: "", yearsExperience: "", bio: "",
  })
  const [error, setError] = useState("")
  const [done,  setDone]  = useState(false)

  const set = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }))

  const ui = {
    title:       locale === "ar" ? "أصبح محترفاً" : locale === "fr" ? "Devenir prestataire" : "Become a provider",
    subtitle:    locale === "ar" ? "أكمل ملفك المهني وابدأ استقبال العملاء" : locale === "fr" ? "Complétez votre profil professionnel et commencez à recevoir des clients" : "Complete your professional profile to start receiving clients",
    bizName:     locale === "ar" ? "اسم النشاط التجاري" : locale === "fr" ? "Nom de l'activité" : "Business name",
    phone:       locale === "ar" ? "رقم الهاتف" : locale === "fr" ? "Téléphone" : "Phone",
    whatsapp:    locale === "ar" ? "واتساب (اختياري)" : locale === "fr" ? "WhatsApp (optionnel)" : "WhatsApp (optional)",
    city:        locale === "ar" ? "المدينة" : locale === "fr" ? "Ville" : "City",
    selectCity:  locale === "ar" ? "اختر مدينة" : locale === "fr" ? "Choisir une ville" : "Select city",
    category:    locale === "ar" ? "فئة الخدمة" : locale === "fr" ? "Catégorie" : "Service category",
    selectCat:   locale === "ar" ? "اختر فئة" : locale === "fr" ? "Choisir une catégorie" : "Select category",
    experience:  locale === "ar" ? "سنوات الخبرة" : locale === "fr" ? "Années d'exp." : "Years of exp.",
    bio:         locale === "ar" ? "وصف نشاطك" : locale === "fr" ? "Décrivez votre activité" : "Describe your business",
    bioPlaceholder: locale === "ar" ? "اكتب نبذة عن خدماتك..." : locale === "fr" ? "Décrivez vos services..." : "Describe your services...",
    submit:      locale === "ar" ? "إنشاء ملفي المهني" : locale === "fr" ? "Créer mon profil pro" : "Create my professional profile",
    submitting:  locale === "ar" ? "جارٍ الإنشاء..." : locale === "fr" ? "Création..." : "Creating...",
    pending:     locale === "ar" ? "سيتم مراجعة ملفك قبل نشره" : locale === "fr" ? "Votre profil sera examiné avant publication" : "Your profile will be reviewed before going live",
    doneTitle:   locale === "ar" ? "تم إنشاء ملفك المهني!" : locale === "fr" ? "Profil créé !" : "Profile created!",
    doneText:    locale === "ar" ? "سيتم مراجعة ملفك من قِبَل فريقنا قبل النشر. ستظهر في نتائج البحث بعد الموافقة." : locale === "fr" ? "Votre profil sera examiné par notre équipe. Il apparaîtra dans les résultats après validation." : "Your profile will be reviewed by our team and appear in search results after approval.",
    continue:    locale === "ar" ? "الانتقال إلى لوحتي" : locale === "fr" ? "Aller à mon tableau de bord" : "Go to my dashboard",
  }

  const mutation = useMutation({
    mutationFn: async () => {
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
      if (!res.ok) throw new Error(data.error ?? "Error")
      return data
    },
    onSuccess: () => {
      // Update Redux immediately so role reflects PROVIDER without page refresh
      if (currentUser) dispatch(setUser({ ...currentUser, role: "PROVIDER" }))
      setDone(true)
      onSuccess()
    },
    onError: (err: any) => setError(err.message),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" dir={isRtl ? "rtl" : "ltr"}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">{ui.title}</h2>
              <p className="text-xs text-gray-500">{ui.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {done ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{ui.doneTitle}</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">{ui.doneText}</p>
              <Button
                onClick={() => { onClose(); window.location.href = `/${locale}/provider/dashboard` }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
              >
                {ui.continue}
              </Button>
            </div>
          ) : (
            <form
              onSubmit={e => { e.preventDefault(); setError(""); mutation.mutate() }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">{ui.bizName} *</Label>
                <Input
                  value={form.businessName}
                  onChange={e => set("businessName", e.target.value)}
                  required
                  placeholder={ui.bizName}
                  className="h-10 border-gray-200 focus:border-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">{ui.phone} *</Label>
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={e => set("phone", e.target.value)}
                    required
                    placeholder="+212 6XX"
                    className="h-10 border-gray-200 focus:border-green-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">{ui.whatsapp}</Label>
                  <Input
                    type="tel"
                    value={form.whatsapp}
                    onChange={e => set("whatsapp", e.target.value)}
                    placeholder="+212 6XX"
                    className="h-10 border-gray-200 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">{ui.city} *</Label>
                  <CityCombobox
                    value={form.cityId}
                    onChange={v => set("cityId", v)}
                    required
                    placeholder={ui.selectCity}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">{ui.experience}</Label>
                  <Input
                    type="number"
                    min="0" max="50"
                    value={form.yearsExperience}
                    onChange={e => set("yearsExperience", e.target.value)}
                    placeholder="0"
                    className="h-10 border-gray-200 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">{ui.category} *</Label>
                <CategoryCombobox
                  value={form.categoryId}
                  onChange={v => set("categoryId", v)}
                  required
                  placeholder={ui.selectCat}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">{ui.bio}</Label>
                <Textarea
                  value={form.bio}
                  onChange={e => set("bio", e.target.value)}
                  rows={3}
                  placeholder={ui.bioPlaceholder}
                  className="border-gray-200 focus:border-green-500 resize-none"
                />
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                {ui.pending}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                {mutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />{ui.submitting}</>
                ) : ui.submit}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
