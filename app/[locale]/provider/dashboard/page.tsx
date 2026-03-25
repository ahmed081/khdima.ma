"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "@/i18n/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Eye, MessageCircle, Phone, Edit } from "lucide-react"
import { useTranslations } from "next-intl"

export default function ProviderDashboardPage() {
  const t = useTranslations('provider')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['provider-dashboard'],
    queryFn: () => fetch('/api/provider/dashboard').then(r => r.json())
  })

  const toggleAvailability = useMutation({
    mutationFn: async () => {
      const newAvail = data?.provider?.availability === 'AVAILABLE' ? 'BUSY' : 'AVAILABLE'
      const res = await fetch('/api/provider/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: newAvail })
      })
      if (!res.ok) throw new Error('Failed to update')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['provider-dashboard'] })
  })

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!data || data.error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{data?.error ?? 'Error loading dashboard'}</div>
  }

  const { provider, stats, contactStats, recentReviews } = data
  const isAvailable = provider?.availability === 'AVAILABLE'

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('dashboardTitle')}</h1>
            <p className="text-gray-500">{provider?.businessName}</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant={isAvailable ? "default" : "outline"}
              className={isAvailable ? 'bg-green-600 hover:bg-green-500' : ''}
              onClick={() => toggleAvailability.mutate()}
              disabled={toggleAvailability.isPending}
            >
              {isAvailable ? t('available') : t('busy')}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/provider/dashboard/edit"><Edit className="h-4 w-4 mr-1" />{t('editProfile')}</Link>
            </Button>
          </div>
        </div>

        {provider?.status === 'PENDING' && (
          <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-6 text-amber-800 text-sm">
            {t('pendingApproval')}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Eye className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats?.profileViews ?? 0}</p>
              <p className="text-xs text-gray-500">{t('profileViews')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats?.rating?.toFixed(1) ?? '0.0'}</p>
              <p className="text-xs text-gray-500">Rating</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{contactStats?.whatsapp ?? 0}</p>
              <p className="text-xs text-gray-500">WhatsApp</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Phone className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{contactStats?.call ?? 0}</p>
              <p className="text-xs text-gray-500">{t('totalContacts')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('reviews')}</CardTitle>
          </CardHeader>
          <CardContent>
            {(!recentReviews || recentReviews.length === 0) ? (
              <p className="text-gray-500 text-sm">No reviews yet.</p>
            ) : (
              <div className="space-y-3">
                {recentReviews.map((rev: any) => (
                  <div key={rev.id} className="border-b pb-3 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{rev.user?.name}</span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <Badge variant="outline" className="text-xs">{new Date(rev.createdAt).toLocaleDateString()}</Badge>
                    </div>
                    {rev.comment && <p className="text-sm text-gray-600">{rev.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
