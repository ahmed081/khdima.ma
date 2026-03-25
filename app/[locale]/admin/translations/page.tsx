"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link } from "@/i18n/navigation"
import { Search, Pencil, Save, X } from "lucide-react"

interface TranslationGroup {
  code:      string
  namespace: string
  locales:   Record<string, string>
}

export default function AdminTranslationsPage() {
  const qc = useQueryClient()

  const [q,         setQ]         = useState('')
  const [namespace, setNamespace] = useState('')
  const [editing,   setEditing]   = useState<{ code: string; locale: string; text: string } | null>(null)
  const [editText,  setEditText]  = useState('')

  const { data, isLoading } = useQuery<{ translations: TranslationGroup[]; total: number }>({
    queryKey: ['admin-translations', q, namespace],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '100' })
      if (q)         params.set('q', q)
      if (namespace) params.set('namespace', namespace)
      return fetch(`/api/admin/translations?${params}`).then(r => r.json())
    },
  })

  const saveMutation = useMutation({
    mutationFn: (payload: { code: string; locale: string; text: string; namespace: string }) =>
      fetch('/api/admin/translations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-translations'] })
      setEditing(null)
    },
  })

  const handleSave = () => {
    if (!editing || !editText.trim()) return
    saveMutation.mutate({
      code:      editing.code,
      locale:    editing.locale,
      text:      editText.trim(),
      namespace: data?.translations.find(t => t.code === editing.code)?.namespace ?? 'general',
    })
  }

  const namespaces = ['', 'category', 'subcategory', 'ui', 'general']

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="text-gray-500 hover:text-gray-700 text-sm">← Dashboard</Link>
          <h1 className="text-2xl font-bold text-gray-900">Translations</h1>
          <span className="text-sm text-gray-500">{data?.total ?? 0} entries</span>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Search code or text..."
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {namespaces.map(ns => (
              <button
                key={ns}
                onClick={() => setNamespace(ns)}
                className={`px-3 py-1.5 rounded text-sm border transition-colors ${
                  namespace === ns ? 'bg-green-700 text-white border-green-700' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {ns || 'All'}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : (
          <div className="space-y-2">
            {(data?.translations ?? []).map(group => (
              <Card key={group.code} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="px-4 py-2 bg-gray-50 border-b flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-gray-700">{group.code}</span>
                    <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{group.namespace}</span>
                  </div>
                  <div className="divide-y">
                    {(['fr', 'en', 'ar'] as const).map(locale => {
                      const text = group.locales[locale]
                      const isEditingThis = editing?.code === group.code && editing?.locale === locale
                      return (
                        <div key={locale} className="px-4 py-2 flex items-center gap-3">
                          <span className={`text-xs font-bold uppercase w-6 ${locale === 'ar' ? 'text-emerald-600' : locale === 'fr' ? 'text-blue-600' : 'text-gray-500'}`}>
                            {locale}
                          </span>
                          {isEditingThis ? (
                            <div className="flex-1 flex gap-2">
                              <Input
                                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                                value={editText}
                                onChange={e => setEditText(e.target.value)}
                                className="flex-1 h-8 text-sm"
                                autoFocus
                              />
                              <button onClick={handleSave} className="p-1 hover:bg-green-50 rounded text-green-600">
                                <Save className="h-4 w-4" />
                              </button>
                              <button onClick={() => setEditing(null)} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span dir={locale === 'ar' ? 'rtl' : 'ltr'} className="flex-1 text-sm text-gray-700">
                                {text ?? <span className="text-gray-400 italic">missing</span>}
                              </span>
                              <button
                                onClick={() => { setEditing({ code: group.code, locale, text: text ?? '' }); setEditText(text ?? '') }}
                                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
