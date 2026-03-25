"use client"

import { Link } from "@/i18n/navigation"
import { useRouter } from "@/i18n/navigation"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslations } from 'next-intl'

export default function RegisterPage() {
  const router = useRouter()
  const t = useTranslations('register')

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  })
  const [localError, setLocalError] = useState("")

  const updateField = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('serverError'))
      return data
    },
    onSuccess: () => router.push('/profile'),
    onError: (err: any) => setLocalError(err.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")
    if (form.password !== form.confirm) {
      setLocalError(t('passwordMismatch'))
      return
    }
    registerMutation.mutate()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Briefcase className="h-7 w-7 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">khdimti.com</span>
        </Link>

        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>{t('fullName')}</Label>
                <Input value={form.name} onChange={e => updateField("name", e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label>{t('email')}</Label>
                <Input type="email" value={form.email} onChange={e => updateField("email", e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label>{t('phone')}</Label>
                <Input type="tel" value={form.phone} onChange={e => updateField("phone", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>{t('password')}</Label>
                <Input type="password" value={form.password} onChange={e => updateField("password", e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label>{t('confirmPassword')}</Label>
                <Input type="password" value={form.confirm} onChange={e => updateField("confirm", e.target.value)} required />
              </div>

              {localError && <p className="text-sm text-red-600">{localError}</p>}

              <Button className="w-full" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? t('loading') : t('submit')}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">{t('hasAccount')} </span>
              <Link href="/login" className="font-medium text-primary hover:underline">{t('login')}</Link>
            </div>

            <div className="mt-3 text-center text-sm">
              <span className="text-muted-foreground">{t('orRegisterAsPro')} </span>
              <Link href="/provider/register" className="font-medium text-red-700 hover:underline">{t('registerAsPro')}</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
