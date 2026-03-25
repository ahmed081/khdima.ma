"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "@/i18n/navigation"
import { ShieldCheck, ShieldOff } from "lucide-react"

interface Props {
  providerId: number
  currentStatus: string
  isVerified: boolean
}

export function AdminProviderActions({ providerId, currentStatus, isVerified }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const patch = async (body: object) => {
    setLoading(true)
    try {
      await fetch('/api/admin/providers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: providerId, ...body }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2 flex-shrink-0 flex-wrap">
      {currentStatus !== 'ACTIVE' && (
        <Button size="sm" className="bg-green-600 hover:bg-green-500 text-white" onClick={() => patch({ status: 'ACTIVE' })} disabled={loading}>
          Approve
        </Button>
      )}
      {currentStatus !== 'SUSPENDED' && (
        <Button size="sm" variant="destructive" onClick={() => patch({ status: 'SUSPENDED' })} disabled={loading}>
          Suspend
        </Button>
      )}
      {currentStatus !== 'PENDING' && (
        <Button size="sm" variant="outline" onClick={() => patch({ status: 'PENDING' })} disabled={loading}>
          Pending
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        className={isVerified ? 'border-blue-300 text-blue-700 hover:bg-blue-50' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}
        onClick={() => patch({ isVerified: !isVerified })}
        disabled={loading}
        title={isVerified ? 'Remove verification' : 'Mark as verified'}
      >
        {isVerified ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
      </Button>
    </div>
  )
}
