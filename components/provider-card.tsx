'use client'
import { Link } from '@/i18n/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, MapPin, MessageCircle, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale } from 'next-intl'

export function ProviderCard({ provider }: { provider: any }) {
  const locale = useLocale()
  const cityName = locale === 'ar' ? provider.city?.nameAr : locale === 'fr' ? provider.city?.nameFr : provider.city?.name
  const catSlug = provider.category?.slug

  return (
    <Card className="hover:shadow-lg transition-all">
      <CardContent className="p-4">
        <Link href={`/services/${catSlug}/${provider.id}`}>
          <div className="flex items-start gap-3 mb-3">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-2xl font-bold text-red-700 flex-shrink-0 overflow-hidden">
              {provider.avatarUrl
                ? <img src={provider.avatarUrl} className="w-full h-full object-cover" alt="" />
                : provider.businessName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{provider.businessName}</h3>
              <p className="text-sm text-gray-500">
                {locale === 'ar' ? provider.category?.nameAr : locale === 'fr' ? provider.category?.nameFr : provider.category?.name}
              </p>
            </div>
            {provider.isVerified && <Badge className="bg-green-100 text-green-700 text-xs">✓</Badge>}
          </div>
          <div className="flex items-center gap-1 mb-2">
            {Array.from({length: 5}).map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < Math.round(provider.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
            ))}
            <span className="text-xs text-gray-500 ml-1">({provider.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
            <MapPin className="h-3 w-3" />{cityName}
          </div>
        </Link>
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-500 text-white" asChild>
            <a href={`https://wa.me/${provider.whatsapp || provider.phone}`} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4 mr-1" />WhatsApp
            </a>
          </Button>
          <Button size="sm" variant="outline" className="flex-1" asChild>
            <a href={`tel:${provider.phone}`}>
              <Phone className="h-4 w-4 mr-1" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
