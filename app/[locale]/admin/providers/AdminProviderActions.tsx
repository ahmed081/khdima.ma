"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "@/i18n/navigation"

interface Props {
  providerId: number
  currentStatus: string
}

export function AdminProviderActions({ providerId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const updateStatus = async (status: string) => {
    setLoading(true)
    try {
      await fetch('/api/admin/providers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: providerId, status })
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2 flex-shrink-0">
      {currentStatus !== 'ACTIVE' && (
        <Button size="sm" className="bg-green-600 hover:bg-green-500 text-white" onClick={() => updateStatus('ACTIVE')} disabled={loading}>
          Approve
        </Button>
      )}
      {currentStatus !== 'SUSPENDED' && (
        <Button size="sm" variant="destructive" onClick={() => updateStatus('SUSPENDED')} disabled={loading}>
          Suspend
        </Button>
      )}
      {currentStatus !== 'PENDING' && (
        <Button size="sm" variant="outline" onClick={() => updateStatus('PENDING')} disabled={loading}>
          Pending
        </Button>
      )}
    </div>
  )
}
