"use client"

import { useQuery, useMutation } from "@tanstack/react-query"
import { useRouter } from "@/i18n/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useTranslations } from "next-intl"

export default function EditProviderProfilePage() {
  const router = useRouter()
  const t = useTranslations('provider')

  const { data } = useQuery({
    queryKey: ['provider-dashboard'],
    queryFn: () => fetch('/api/provider/dashboard').then(r => r.json())
  })

  const [form, setForm] = useState({
    bio: "",
    phone: "",
    whatsapp: "",
    availability: "AVAILABLE",
    yearsExperience: "",
    avatarUrl: "",
  })

  useEffect(() => {
    if (data?.provider) {
      const p = data.provider
      setForm({
        bio: p.bio ?? "",
        phone: p.phone ?? "",
        whatsapp: p.whatsapp ?? "",
        availability: p.availability ?? "AVAILABLE",
        yearsExperience: p.yearsExperience?.toString() ?? "",
        avatarUrl: p.avatarUrl ?? "",
      })
    }
  }, [data])

  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/provider/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: form.bio || undefined,
          phone: form.phone,
          whatsapp: form.whatsapp || undefined,
          availability: form.availability,
          yearsExperience: form.yearsExperience ? parseInt(form.yearsExperience) : undefined,
          avatarUrl: form.avatarUrl || undefined,
        })
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error ?? 'Update failed')
      return d
    },
    onSuccess: () => {
      setSuccess(true)
      setTimeout(() => router.push('/provider/dashboard'), 1500)
    },
    onError: (err: any) => setError(err.message)
  })

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{t('editProfile')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); updateMutation.mutate() }}>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={4} />
              </div>

              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required />
              </div>

              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input type="tel" value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label>{t('availability')}</Label>
                <select
                  value={form.availability}
                  onChange={e => setForm(p => ({ ...p, availability: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm bg-white"
                >
                  <option value="AVAILABLE">{t('available')}</option>
                  <option value="BUSY">{t('busy')}</option>
                  <option value="INACTIVE">{t('inactive')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Années d&apos;expérience</Label>
                <Input type="number" min="0" max="50" value={form.yearsExperience} onChange={e => setForm(p => ({ ...p, yearsExperience: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label>URL Avatar</Label>
                <Input type="url" value={form.avatarUrl} onChange={e => setForm(p => ({ ...p, avatarUrl: e.target.value }))} />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-green-600">Profil mis à jour !</p>}

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
                  Annuler
                </Button>
                <Button type="submit" className="flex-1 bg-red-700 hover:bg-red-600" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
