'use client'
import { Link } from '@/i18n/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, MapPin, MessageCircle, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale, useTranslations } from 'next-intl'

interface Provider {
  id:           number
  businessName: string
  avatarUrl?:   string | null
  rating:       number
  reviewCount:  number
  isVerified:   boolean
  phone:        string
  whatsapp?:    string | null
  availability: string
  city?:        { name: string }
  category?:    { code: string; slug: string; icon?: string | null; name: string }
}

export function ProviderCard({ provider }: { provider: Provider }) {
  const locale = useLocale()
  const t      = useTranslations('provider')
  const isRTL  = locale === 'ar'
  const catSlug = provider.category?.slug ?? 'services'

  return (
    <Card className="hover:shadow-lg transition-all hover:border-green-300 group">
      <CardContent className="p-4">
        <Link href={`/services/${catSlug}/${provider.id}`}>
          <div className={`flex items-start gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl font-bold text-green-700 flex-shrink-0 overflow-hidden">
              {provider.avatarUrl
                ? <img src={provider.avatarUrl} className="w-full h-full object-cover" alt="" />
                : provider.businessName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-green-700 transition-colors">
                {provider.businessName}
              </h3>
              <p className="text-sm text-gray-500">{provider.category?.name}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {provider.isVerified && (
                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">✓</Badge>
              )}
              {provider.availability === 'AVAILABLE' && (
                <span className="w-2 h-2 rounded-full bg-green-500 block" title={t('available')} />
              )}
            </div>
          </div>

          {/* Stars */}
          <div className={`flex items-center gap-0.5 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < Math.round(provider.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
            ))}
            <span className="text-xs text-gray-400 ml-1">({provider.reviewCount})</span>
          </div>

          {/* City */}
          <div className={`flex items-center gap-1 text-sm text-gray-500 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{provider.city?.name}</span>
          </div>
        </Link>

        {/* Contact buttons */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-500 text-white" asChild>
            <a
              href={`https://wa.me/${(provider.whatsapp ?? provider.phone).replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="h-4 w-4 mr-1" />WhatsApp
            </a>
          </Button>
          <Button size="sm" variant="outline" className="flex-1 border-green-300 text-green-700 hover:bg-green-50" asChild>
            <a href={`tel:${provider.phone}`}>
              <Phone className="h-4 w-4 mr-1" />
              {t('call')}
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
