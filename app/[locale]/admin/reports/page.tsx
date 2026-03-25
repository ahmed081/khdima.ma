'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@/i18n/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const STATUS_COLORS: Record<string, string> = {
  OPEN:      'bg-red-100 text-red-700',
  REVIEWED:  'bg-amber-100 text-amber-700',
  DISMISSED: 'bg-gray-100 text-gray-500',
}

export default function AdminReportsPage() {
  const [filter, setFilter] = useState('')
  const [note, setNote]   = useState<Record<number, string>>({})
  const qc = useQueryClient()

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['admin-reports', filter],
    queryFn: () => fetch(`/api/admin/reports${filter ? `?status=${filter}` : ''}`).then(r => r.json()),
  })

  const patch = useMutation({
    mutationFn: (body: object) =>
      fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reports'] }),
  })

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="text-gray-500 hover:text-gray-700 text-sm">← Dashboard</Link>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Disputes</h1>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {['', 'OPEN', 'REVIEWED', 'DISMISSED'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded text-sm font-medium border transition-colors ${
                filter === s
                  ? 'bg-green-700 text-white border-green-700'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <p className="text-center text-gray-500 py-16">No reports found</p>
        ) : (
          <div className="space-y-4">
            {reports.map((r: any) => (
              <Card key={r.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <CardTitle className="text-base">
                        Report #{r.id} — {r.provider?.businessName}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {r.reporter ? `${r.reporter.name} (${r.reporter.email})` : 'Anonymous'} ·{' '}
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[r.status]}`}>
                      {r.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Reason: <span className="font-normal">{r.reason}</span></p>
                    {r.details && <p className="text-sm text-gray-600 mt-1">{r.details}</p>}
                  </div>
                  {r.adminNote && (
                    <p className="text-sm bg-amber-50 border border-amber-200 rounded p-2 text-amber-800">
                      Admin note: {r.adminNote}
                    </p>
                  )}
                  <div className="flex gap-2 flex-wrap items-end">
                    <input
                      className="flex-1 min-w-[180px] border rounded px-3 py-1.5 text-sm"
                      placeholder="Add admin note (optional)"
                      value={note[r.id] ?? ''}
                      onChange={e => setNote(n => ({ ...n, [r.id]: e.target.value }))}
                    />
                    {r.status !== 'REVIEWED' && (
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-white"
                        disabled={patch.isPending}
                        onClick={() => patch.mutate({ id: r.id, status: 'REVIEWED', adminNote: note[r.id] ?? r.adminNote })}>
                        Mark Reviewed
                      </Button>
                    )}
                    {r.status !== 'DISMISSED' && (
                      <Button size="sm" variant="outline"
                        disabled={patch.isPending}
                        onClick={() => patch.mutate({ id: r.id, status: 'DISMISSED', adminNote: note[r.id] ?? r.adminNote })}>
                        Dismiss
                      </Button>
                    )}
                    {r.status !== 'OPEN' && (
                      <Button size="sm" variant="outline" className="border-red-300 text-red-700"
                        disabled={patch.isPending}
                        onClick={() => patch.mutate({ id: r.id, status: 'OPEN' })}>
                        Reopen
                      </Button>
                    )}
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/services/${r.provider?.id}`} target="_blank">View Profile</Link>
                    </Button>
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
