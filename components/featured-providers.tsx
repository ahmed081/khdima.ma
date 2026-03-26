'use client'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { ProviderCard } from '@/components/provider-card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useScrollAnimation, animations } from '@/hooks/useScrollAnimation'

export function FeaturedProviders() {
  const t      = useTranslations('home')
  const locale = useLocale()
  const { ref, isVisible } = useScrollAnimation()

  const { data, isLoading } = useQuery({
    queryKey: ['featured-providers', locale],
    queryFn: () => fetch(`/api/providers?limit=6&locale=${locale}`).then(r => r.json()),
  })

  const providers: any[] = Array.isArray(data?.providers) ? data.providers : []

  return (
    <section ref={ref as any} className="py-20 bg-gradient-to-b from-white to-amber-50/50">
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 ${animations.fadeUp(isVisible)}`}>
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 rounded-full px-3 py-1 text-xs font-semibold mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            {locale === 'ar' ? 'الأكثر تقييمًا' : locale === 'fr' ? 'Les mieux notés' : 'Top rated'}
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{t('featuredProviders')}</h2>
          <p className="text-gray-500">{t('featuredSubtitle')}</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <p className="text-center text-gray-400 py-10">
            {locale === 'ar' ? 'لا يوجد مزودون بعد' : locale === 'fr' ? 'Aucun prestataire pour le moment' : 'No providers yet'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {providers.map((p: any, i: number) => (
              <div key={p.id} className={animations.fadeUp(isVisible, i * 80)}>
                <ProviderCard provider={p} />
              </div>
            ))}
          </div>
        )}

        <div className={`text-center mt-10 ${animations.fadeUp(isVisible, 400)}`}>
          <Button
            variant="outline"
            className="border-green-600 text-green-700 hover:bg-green-50 gap-2 rounded-xl px-6"
            asChild
          >
            <Link href="/services">
              {t('browseAll')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
