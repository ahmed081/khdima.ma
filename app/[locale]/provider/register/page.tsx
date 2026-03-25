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
import { useTranslations } from 'next-intl'

export default function ProviderRegisterPage() {
  const router = useRouter()
  const t = useTranslations('provider')

  const [step, setStep] = useState(1)
  const [localError, setLocalError] = useState("")
  const [form, setForm] = useState({
    // Step 1: Account
    name: "",
    email: "",
    password: "",
    confirm: "",
    // Step 2: Business
    businessName: "",
    phone: "",
    whatsapp: "",
    cityId: "",
    categoryId: "",
    yearsExperience: "",
    bio: "",
  })

  const updateField = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => fetch('/api/cities').then(r => r.json())
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then(r => r.json())
  })

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/provider-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          businessName: form.businessName,
          phone: form.phone,
          whatsapp: form.whatsapp || undefined,
          cityId: parseInt(form.cityId),
          categoryId: parseInt(form.categoryId),
          yearsExperience: form.yearsExperience ? parseInt(form.yearsExperience) : undefined,
          bio: form.bio || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Registration failed")
      return data
    },
    onSuccess: () => router.push('/provider/dashboard'),
    onError: (err: any) => setLocalError(err.message),
  })

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")
    if (form.password !== form.confirm) {
      setLocalError("Passwords do not match")
      return
    }
    setStep(2)
  }

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")
    registerMutation.mutate()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-700">
            <Briefcase className="h-7 w-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground">khdimti.com</span>
        </Link>

        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">{t('registerTitle')}</CardTitle>
            <CardDescription>{t('registerSubtitle')}</CardDescription>
            <div className="flex gap-2 mt-2">
              <div className={`h-2 flex-1 rounded ${step >= 1 ? 'bg-red-700' : 'bg-gray-200'}`} />
              <div className={`h-2 flex-1 rounded ${step >= 2 ? 'bg-red-700' : 'bg-gray-200'}`} />
            </div>
          </CardHeader>

          <CardContent>
            {step === 1 && (
              <form className="space-y-4" onSubmit={handleStep1}>
                <p className="text-sm font-medium text-gray-700">Étape 1 / 2 — Informations du compte</p>

                <div className="space-y-2">
                  <Label>Nom complet</Label>
                  <Input value={form.name} onChange={e => updateField("name", e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={e => updateField("email", e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label>Mot de passe</Label>
                  <Input type="password" value={form.password} onChange={e => updateField("password", e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label>Confirmer le mot de passe</Label>
                  <Input type="password" value={form.confirm} onChange={e => updateField("confirm", e.target.value)} required />
                </div>

                {localError && <p className="text-sm text-red-600">{localError}</p>}

                <Button className="w-full bg-red-700 hover:bg-red-600" type="submit">
                  Suivant →
                </Button>
              </form>
            )}

            {step === 2 && (
              <form className="space-y-4" onSubmit={handleStep2}>
                <p className="text-sm font-medium text-gray-700">Étape 2 / 2 — Informations professionnelles</p>

                <div className="space-y-2">
                  <Label>Nom du commerce / activité</Label>
                  <Input value={form.businessName} onChange={e => updateField("businessName", e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input type="tel" value={form.phone} onChange={e => updateField("phone", e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label>WhatsApp (optionnel)</Label>
                  <Input type="tel" value={form.whatsapp} onChange={e => updateField("whatsapp", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Ville</Label>
                  <select
                    value={form.cityId}
                    onChange={e => updateField("cityId", e.target.value)}
                    required
                    className="w-full border rounded px-3 py-2 text-sm bg-white"
                  >
                    <option value="">Sélectionnez une ville</option>
                    {cities.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.nameFr || c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Catégorie de service</Label>
                  <select
                    value={form.categoryId}
                    onChange={e => updateField("categoryId", e.target.value)}
                    required
                    className="w-full border rounded px-3 py-2 text-sm bg-white"
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.nameFr || c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Années d&apos;expérience</Label>
                  <Input type="number" min="0" max="50" value={form.yearsExperience} onChange={e => updateField("yearsExperience", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Description / Bio</Label>
                  <Textarea value={form.bio} onChange={e => updateField("bio", e.target.value)} rows={3} />
                </div>

                {localError && <p className="text-sm text-red-600">{localError}</p>}

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    ← Retour
                  </Button>
                  <Button className="flex-1 bg-red-700 hover:bg-red-600" disabled={registerMutation.isPending}>
                    {registerMutation.isPending ? "Inscription..." : "S'inscrire"}
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
