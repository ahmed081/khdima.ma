"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from "@/i18n/navigation"
import { Plus, Pencil, ToggleLeft, ToggleRight } from "lucide-react"

interface CategoryRow {
  id:       number
  code:     string
  slug:     string
  icon:     string | null
  order:    number
  isActive: boolean
  translations:    Record<string, string>
  providerCount:    number
  subcategoryCount: number
}

const empty = { code: '', slug: '', icon: '', fr: '', en: '', ar: '', order: 0 }

export default function AdminCategoriesPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<CategoryRow | null>(null)
  const [form,    setForm]    = useState(empty)
  const [showAdd, setShowAdd] = useState(false)
  const [err,     setErr]     = useState('')

  const { data: categories = [], isLoading } = useQuery<CategoryRow[]>({
    queryKey: ['admin-categories'],
    queryFn: () => fetch('/api/admin/categories').then(r => r.json()),
  })

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/admin/categories', {
        method: payload.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error ?? 'Error')
      return d
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] })
      setEditing(null)
      setShowAdd(false)
      setForm(empty)
      setErr('')
    },
    onError: (e: any) => setErr(e.message),
  })

  const toggleMutation = useMutation({
    mutationFn: (cat: CategoryRow) => fetch('/api/admin/categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: cat.id, isActive: !cat.isActive }),
    }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-categories'] }),
  })

  const openEdit = (cat: CategoryRow) => {
    setEditing(cat)
    setForm({
      code:  cat.code,
      slug:  cat.slug,
      icon:  cat.icon ?? '',
      order: cat.order,
      fr:    cat.translations.fr ?? '',
      en:    cat.translations.en ?? '',
      ar:    cat.translations.ar ?? '',
    })
    setShowAdd(false)
    setErr('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    const payload: any = { ...form, order: parseInt(String(form.order)) }
    if (editing) payload.id = editing.id
    saveMutation.mutate(payload)
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-500 hover:text-gray-700 text-sm">← Dashboard</Link>
            <h1 className="text-2xl font-bold text-gray-900">Service Categories</h1>
          </div>
          <Button className="bg-green-700 hover:bg-green-600" onClick={() => { setShowAdd(!showAdd); setEditing(null); setForm(empty) }}>
            <Plus className="h-4 w-4 mr-1" /> Add Category
          </Button>
        </div>

        {/* Add / Edit form */}
        {(showAdd || editing) && (
          <Card className="mb-6 border-green-200">
            <CardHeader>
              <CardTitle className="text-base">{editing ? `Edit: ${editing.code}` : 'New Category'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {!editing && (
                  <>
                    <div>
                      <Label>Code (uppercase, e.g. PLUMBING)</Label>
                      <Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} required disabled={!!editing} />
                    </div>
                    <div>
                      <Label>Slug (url-friendly, e.g. plumbing)</Label>
                      <Input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value.toLowerCase() }))} required disabled={!!editing} />
                    </div>
                  </>
                )}
                <div>
                  <Label>Icon (emoji)</Label>
                  <Input value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} placeholder="🔧" />
                </div>
                <div>
                  <Label>Order</Label>
                  <Input type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <Label>French (fr)</Label>
                  <Input value={form.fr} onChange={e => setForm(p => ({ ...p, fr: e.target.value }))} placeholder="Plomberie" />
                </div>
                <div>
                  <Label>English (en)</Label>
                  <Input value={form.en} onChange={e => setForm(p => ({ ...p, en: e.target.value }))} placeholder="Plumbing" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Arabic (ar)</Label>
                  <Input dir="rtl" value={form.ar} onChange={e => setForm(p => ({ ...p, ar: e.target.value }))} placeholder="السباكة" />
                </div>
                {err && <p className="sm:col-span-2 text-sm text-red-600">{err}</p>}
                <div className="sm:col-span-2 flex gap-3">
                  <Button type="submit" className="bg-green-700 hover:bg-green-600" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setEditing(null); setShowAdd(false) }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Categories table */}
        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : (
          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat.id} className={`bg-white rounded-lg border p-4 flex items-center justify-between gap-4 ${!cat.isActive ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl w-8 text-center">{cat.icon ?? '—'}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-gray-700">{cat.code}</span>
                      <span className="text-xs text-gray-400">/{cat.slug}</span>
                    </div>
                    <div className="flex gap-3 text-sm text-gray-600 mt-0.5">
                      <span>{cat.translations.fr ?? '—'}</span>
                      <span className="text-gray-300">|</span>
                      <span>{cat.translations.en ?? '—'}</span>
                      <span className="text-gray-300">|</span>
                      <span dir="rtl">{cat.translations.ar ?? '—'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-gray-400">{cat.providerCount} providers</span>
                  <button onClick={() => openEdit(cat)} className="p-1.5 hover:bg-gray-100 rounded">
                    <Pencil className="h-4 w-4 text-gray-500" />
                  </button>
                  <button onClick={() => toggleMutation.mutate(cat)} className="p-1.5 hover:bg-gray-100 rounded">
                    {cat.isActive
                      ? <ToggleRight className="h-5 w-5 text-green-600" />
                      : <ToggleLeft className="h-5 w-5 text-gray-400" />}
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
