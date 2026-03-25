'use client'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { ProviderCard } from '@/components/provider-card'
import { Button } from '@/components/ui/button'

export function FeaturedProviders() {
  const t      = useTranslations('home')
  const locale = useLocale()

  const { data, isLoading } = useQuery({
    queryKey: ['featured-providers', locale],
    queryFn:  () => fetch(`/api/providers?limit=6&locale=${locale}`).then(r => r.json()),
  })

  // Guard: ensure providers is always an array
  const providers: any[] = Array.isArray(data?.providers) ? data.providers : []

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">{t('featuredProviders')}</h2>
        <p className="text-center text-gray-500 mb-10">{t('featuredSubtitle')}</p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <p className="text-center text-gray-400 py-10">
            {locale === 'ar' ? 'لا يوجد مزودون بعد' : locale === 'fr' ? 'Aucun prestataire pour le moment' : 'No providers yet'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {providers.map((p: any) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-50" asChild>
            <Link href="/services">{t('browseAll')}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
