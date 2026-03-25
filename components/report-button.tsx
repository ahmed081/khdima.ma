'use client'

import { useState } from 'react'
import { Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale } from 'next-intl'

const REASONS = {
  fr: ['Informations incorrectes', 'Comportement inapproprié', 'Arnaque ou fraude', 'Photos trompeuses', 'Autre'],
  en: ['Incorrect information', 'Inappropriate behavior', 'Scam or fraud', 'Misleading photos', 'Other'],
  ar: ['معلومات غير صحيحة', 'سلوك غير لائق', 'احتيال أو نصب', 'صور مضللة', 'أخرى'],
}

const LABELS = {
  fr: { report: 'Signaler', title: 'Signaler ce professionnel', send: 'Envoyer', cancel: 'Annuler', details: 'Détails (optionnel)', reason: 'Raison', sent: 'Signalement envoyé, merci.' },
  en: { report: 'Report', title: 'Report this provider', send: 'Send', cancel: 'Cancel', details: 'Details (optional)', reason: 'Reason', sent: 'Report sent, thank you.' },
  ar: { report: 'إبلاغ', title: 'الإبلاغ عن هذا المزود', send: 'إرسال', cancel: 'إلغاء', details: 'تفاصيل (اختياري)', reason: 'السبب', sent: 'تم الإرسال، شكراً لك.' },
}

export function ReportButton({ providerId }: { providerId: number }) {
  const locale = useLocale() as 'fr' | 'en' | 'ar'
  const L = LABELS[locale] ?? LABELS.fr
  const reasons = REASONS[locale] ?? REASONS.fr

  const [open, setOpen]       = useState(false)
  const [reason, setReason]   = useState('')
  const [details, setDetails] = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!reason) return
    setLoading(true)
    try {
      await fetch(`/api/providers/${providerId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, details }),
      })
      setSent(true)
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  if (sent) return <p className="text-xs text-gray-400">{L.sent}</p>

  return (
    <>
      <button
        className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
        onClick={() => setOpen(true)}
      >
        <Flag className="h-3 w-3" />{L.report}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">{L.title}</h3>

            <label className="text-sm font-medium text-gray-700 block mb-1">{L.reason}</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm mb-3 bg-white"
              value={reason}
              onChange={e => setReason(e.target.value)}
            >
              <option value="">—</option>
              {reasons.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            <label className="text-sm font-medium text-gray-700 block mb-1">{L.details}</label>
            <textarea
              className="w-full border rounded px-3 py-2 text-sm mb-4 resize-none"
              rows={3}
              value={details}
              onChange={e => setDetails(e.target.value)}
            />

            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>{L.cancel}</Button>
              <Button size="sm" className="bg-red-600 hover:bg-red-500 text-white" disabled={!reason || loading} onClick={submit}>
                {L.send}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
