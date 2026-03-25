"use client"

import { Link, useRouter } from "@/i18n/navigation"
import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLocale } from 'next-intl'

export default function ProviderRegisterPage() {
  const router = useRouter()
  const locale = useLocale()

  const [step,       setStep]       = useState(1)
  const [localError, setLocalError] = useState("")
  const [form,       setForm]       = useState({
    name: "", email: "", password: "", confirm: "",
    businessName: "", phone: "", whatsapp: "",
    cityId: "", categoryId: "", yearsExperience: "", bio: "",
  })

  const set = (key: string, value: string) => setForm(p => ({ ...p, [key]: value }))

  const { data: cities = [] } = useQuery({
    queryKey: ['cities', locale],
    queryFn: () => fetch(`/api/cities?locale=${locale}`).then(r => r.json()),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', locale],
    queryFn: () => fetch(`/api/categories?locale=${locale}`).then(r => r.json()),
  })

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/provider-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:           form.name,
          email:          form.email,
          password:       form.password,
          businessName:   form.businessName,
          phone:          form.phone,
          whatsapp:       form.whatsapp || undefined,
          cityId:         parseInt(form.cityId),
          categoryId:     parseInt(form.categoryId),
          yearsExperience: form.yearsExperience ? parseInt(form.yearsExperience) : undefined,
          bio:            form.bio || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Registration failed")
      return data
    },
    onSuccess: () => router.push('/provider/dashboard'),
    onError:   (err: any) => setLocalError(err.message),
  })

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")
    if (form.password !== form.confirm) {
      setLocalError(locale === 'ar' ? 'كلمات المرور غير متطابقة' : locale === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match')
      return
    }
    setStep(2)
  }

  const L = {
    title:           locale === 'ar' ? 'أضف نشاطك التجاري'           : locale === 'fr' ? 'Référencer mon activité'     : 'List your business',
    subtitle:        locale === 'ar' ? 'انضم إلى آلاف المحترفين'       : locale === 'fr' ? 'Rejoignez des milliers de pros sur khdimti.com' : 'Join thousands of professionals on khdimti.com',
    step1Title:      locale === 'ar' ? 'الخطوة 1/2 — معلومات الحساب' : locale === 'fr' ? 'Étape 1/2 — Compte'          : 'Step 1/2 — Account',
    step2Title:      locale === 'ar' ? 'الخطوة 2/2 — معلومات المهنة' : locale === 'fr' ? 'Étape 2/2 — Activité'        : 'Step 2/2 — Business',
    fullName:        locale === 'ar' ? 'الاسم الكامل'                   : locale === 'fr' ? 'Nom complet'                 : 'Full name',
    email:           locale === 'ar' ? 'البريد الإلكتروني'              : locale === 'fr' ? 'Email'                       : 'Email',
    password:        locale === 'ar' ? 'كلمة المرور'                    : locale === 'fr' ? 'Mot de passe'                : 'Password',
    confirm:         locale === 'ar' ? 'تأكيد كلمة المرور'              : locale === 'fr' ? 'Confirmer le mot de passe'   : 'Confirm password',
    next:            locale === 'ar' ? 'التالي ←'                       : locale === 'fr' ? 'Suivant →'                   : 'Next →',
    businessName:    locale === 'ar' ? 'اسم النشاط التجاري'             : locale === 'fr' ? "Nom de l'activité"           : 'Business name',
    phone:           locale === 'ar' ? 'الهاتف'                         : locale === 'fr' ? 'Téléphone'                   : 'Phone',
    whatsapp:        locale === 'ar' ? 'واتساب (اختياري)'               : locale === 'fr' ? 'WhatsApp (optionnel)'        : 'WhatsApp (optional)',
    city:            locale === 'ar' ? 'المدينة'                        : locale === 'fr' ? 'Ville'                       : 'City',
    selectCity:      locale === 'ar' ? 'اختر مدينة'                    : locale === 'fr' ? 'Sélectionnez une ville'       : 'Select a city',
    category:        locale === 'ar' ? 'فئة الخدمة'                    : locale === 'fr' ? 'Catégorie de service'         : 'Service category',
    selectCat:       locale === 'ar' ? 'اختر فئة'                      : locale === 'fr' ? 'Sélectionnez une catégorie'   : 'Select a category',
    experience:      locale === 'ar' ? 'سنوات الخبرة'                  : locale === 'fr' ? "Années d'expérience"          : 'Years of experience',
    bio:             locale === 'ar' ? 'الوصف / نبذة'                  : locale === 'fr' ? 'Description / Bio'            : 'Description / Bio',
    back:            locale === 'ar' ? '← رجوع'                        : locale === 'fr' ? '← Retour'                    : '← Back',
    register:        locale === 'ar' ? 'إنشاء الحساب'                  : locale === 'fr' ? "S'inscrire"                  : 'Register',
    registering:     locale === 'ar' ? '...'                             : locale === 'fr' ? 'Inscription...'              : 'Registering...',
  }

  return (
    <div className="min-h-screen bg-background" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-700">
            <Briefcase className="h-7 w-7 text-white" />
          </div>
          <span className="text-2xl font-bold">khdimti.com</span>
        </Link>

        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">{L.title}</CardTitle>
            <CardDescription>{L.subtitle}</CardDescription>
            <div className="flex gap-2 mt-2">
              <div className={`h-2 flex-1 rounded ${step >= 1 ? 'bg-green-700' : 'bg-gray-200'}`} />
              <div className={`h-2 flex-1 rounded ${step >= 2 ? 'bg-green-700' : 'bg-gray-200'}`} />
            </div>
          </CardHeader>

          <CardContent>
            {step === 1 && (
              <form className="space-y-4" onSubmit={handleStep1}>
                <p className="text-sm font-medium text-gray-700">{L.step1Title}</p>
                <div className="space-y-2">
                  <Label>{L.fullName}</Label>
                  <Input value={form.name} onChange={e => set("name", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>{L.email}</Label>
                  <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>{L.password}</Label>
                  <Input type="password" value={form.password} onChange={e => set("password", e.target.value)} required minLength={8} />
                </div>
                <div className="space-y-2">
                  <Label>{L.confirm}</Label>
                  <Input type="password" value={form.confirm} onChange={e => set("confirm", e.target.value)} required />
                </div>
                {localError && <p className="text-sm text-red-600">{localError}</p>}
                <Button className="w-full bg-green-700 hover:bg-green-600" type="submit">{L.next}</Button>
              </form>
            )}

            {step === 2 && (
              <form className="space-y-4" onSubmit={e => { e.preventDefault(); setLocalError(""); registerMutation.mutate() }}>
                <p className="text-sm font-medium text-gray-700">{L.step2Title}</p>
                <div className="space-y-2">
                  <Label>{L.businessName}</Label>
                  <Input value={form.businessName} onChange={e => set("businessName", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>{L.phone}</Label>
                  <Input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} required placeholder="+212600000000" />
                </div>
                <div className="space-y-2">
                  <Label>{L.whatsapp}</Label>
                  <Input type="tel" value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{L.city}</Label>
                  <select value={form.cityId} onChange={e => set("cityId", e.target.value)} required className="w-full border rounded px-3 py-2 text-sm bg-white">
                    <option value="">{L.selectCity}</option>
                    {cities.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>{L.category}</Label>
                  <select value={form.categoryId} onChange={e => set("categoryId", e.target.value)} required className="w-full border rounded px-3 py-2 text-sm bg-white">
                    <option value="">{L.selectCat}</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>{L.experience}</Label>
                  <Input type="number" min="0" max="50" value={form.yearsExperience} onChange={e => set("yearsExperience", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{L.bio}</Label>
                  <Textarea value={form.bio} onChange={e => set("bio", e.target.value)} rows={3} />
                </div>
                {localError && <p className="text-sm text-red-600">{localError}</p>}
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>{L.back}</Button>
                  <Button className="flex-1 bg-green-700 hover:bg-green-600" disabled={registerMutation.isPending}>
                    {registerMutation.isPending ? L.registering : L.register}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
