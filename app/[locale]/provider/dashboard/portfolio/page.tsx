"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from "@/i18n/navigation"
import { useLocale } from "next-intl"
import { Plus, Trash2, ImageIcon } from "lucide-react"

interface PortfolioImage {
  id:       number
  url:      string
  caption:  string | null
  isBefore: boolean
  pairId:   string | null
  order:    number
}

const empty = { url: '', caption: '', isBefore: false }

export default function ProviderPortfolioPage() {
  const locale = useLocale()
  const qc     = useQueryClient()

  const [form, setForm]   = useState(empty)
  const [err,  setErr]    = useState('')
  const [show, setShow]   = useState(false)

  const labels = {
    title:    locale === 'ar' ? 'معرض الأعمال' : locale === 'fr' ? 'Mon Portfolio' : 'My Portfolio',
    add:      locale === 'ar' ? 'إضافة صورة'   : locale === 'fr' ? 'Ajouter une image' : 'Add Image',
    url:      locale === 'ar' ? 'رابط الصورة'   : locale === 'fr' ? "URL de l'image" : 'Image URL',
    caption:  locale === 'ar' ? 'تعليق'          : locale === 'fr' ? 'Légende' : 'Caption',
    before:   locale === 'ar' ? 'صورة قبل'       : locale === 'fr' ? 'Image "avant"' : '"Before" image',
    save:     locale === 'ar' ? 'حفظ'            : locale === 'fr' ? 'Enregistrer' : 'Save',
    cancel:   locale === 'ar' ? 'إلغاء'          : locale === 'fr' ? 'Annuler' : 'Cancel',
    empty:    locale === 'ar' ? 'لا توجد صور بعد. أضف أولى صورك!' : locale === 'fr' ? 'Aucune image encore. Ajoutez votre première photo !' : 'No images yet. Add your first photo!',
    back:     locale === 'ar' ? '← لوحة التحكم' : locale === 'fr' ? '← Tableau de bord' : '← Dashboard',
    del:      locale === 'ar' ? 'حذف'            : locale === 'fr' ? 'Supprimer' : 'Delete',
    hint:     locale === 'ar' ? 'حتى 10 صور. الصور قبل/بعد توضح جودة عملك.' : locale === 'fr' ? "Jusqu'à 10 images. Les photos avant/après montrent la qualité de votre travail." : 'Up to 10 images. Before/after photos showcase your work quality.',
  }

  const { data: images = [], isLoading } = useQuery<PortfolioImage[]>({
    queryKey: ['portfolio'],
    queryFn: () => fetch('/api/provider/portfolio').then(r => r.json()),
  })

  const addMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/provider/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error ?? 'Error')
      return d
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolio'] })
      setForm(empty)
      setShow(false)
      setErr('')
    },
    onError: (e: any) => setErr(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => fetch('/api/provider/portfolio', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portfolio'] }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    if (!form.url.startsWith('http')) {
      setErr('Please enter a valid image URL starting with http')
      return
    }
    addMutation.mutate()
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/provider/dashboard" className="text-gray-500 hover:text-gray-700 text-sm">{labels.back}</Link>
            <h1 className="text-2xl font-bold text-gray-900">{labels.title}</h1>
            <span className="text-sm text-gray-400">{images.length}/10</span>
          </div>
          {images.length < 10 && (
            <Button className="bg-green-700 hover:bg-green-600" onClick={() => setShow(!show)}>
              <Plus className="h-4 w-4 mr-1" />{labels.add}
            </Button>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-6">{labels.hint}</p>

        {/* Add form */}
        {show && (
          <Card className="mb-6 border-green-200">
            <CardHeader><CardTitle className="text-base">{labels.add}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>{labels.url}</Label>
                  <Input
                    type="url"
                    value={form.url}
                    onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
                    placeholder="https://example.com/photo.jpg"
                    required
                  />
                </div>
                <div>
                  <Label>{labels.caption}</Label>
                  <Input
                    value={form.caption}
                    onChange={e => setForm(p => ({ ...p, caption: e.target.value }))}
                    placeholder={locale === 'ar' ? 'وصف اختياري' : locale === 'fr' ? 'Description optionnelle' : 'Optional description'}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isBefore"
                    checked={form.isBefore}
                    onChange={e => setForm(p => ({ ...p, isBefore: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="isBefore">{labels.before}</Label>
                </div>
                {err && <p className="text-sm text-red-600">{err}</p>}
                <div className="flex gap-3">
                  <Button type="submit" className="bg-green-700 hover:bg-green-600" disabled={addMutation.isPending}>
                    {addMutation.isPending ? '...' : labels.save}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setShow(false); setErr('') }}>{labels.cancel}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Images grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-square bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p>{labels.empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {images.map(img => (
              <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img src={img.url} alt={img.caption ?? ''} className="w-full h-full object-cover" />
                {img.isBefore && (
                  <span className="absolute top-2 left-2 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded">
                    {locale === 'ar' ? 'قبل' : locale === 'fr' ? 'Avant' : 'Before'}
                  </span>
                )}
                {img.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-xs p-2">
                    {img.caption}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => deleteMutation.mutate(img.id)}
                    className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-full"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
