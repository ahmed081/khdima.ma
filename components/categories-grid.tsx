'use client'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useScrollAnimation, animations } from '@/hooks/useScrollAnimation'

export function CategoriesGrid() {
  const t      = useTranslations('home')
  const locale = useLocale()
  const { ref, isVisible } = useScrollAnimation()

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', locale],
    queryFn: () => fetch(`/api/categories?locale=${locale}`).then(r => r.json()),
  })

  return (
    <section ref={ref as any} className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className={animations.fadeUp(isVisible)}>
          <h2 className="text-3xl font-extrabold text-center mb-2 text-gray-900">{t('popularCategories')}</h2>
          <p className="text-center text-gray-500 mb-12">{t('categoriesSubtitle')}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat: any, i: number) => (
            <Link key={cat.id} href={`/services/${cat.slug}`}>
              <div
                className={`group flex flex-col items-center text-center p-5 rounded-2xl border border-gray-100 bg-white hover:border-green-300 hover:shadow-lg hover:shadow-green-500/10 hover:-translate-y-1 cursor-pointer transition-all duration-300 ${animations.scaleUp(isVisible, i * 60)}`}
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-50 group-hover:bg-green-50 flex items-center justify-center mb-3 text-3xl transition-colors duration-300">
                  {cat.icon ?? '🔨'}
                </div>
                <p className="font-semibold text-sm text-gray-800 group-hover:text-green-700 transition-colors leading-tight">
                  {cat.name}
                </p>
                {cat.providerCount > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    {cat.providerCount} {locale === 'ar' ? 'محترف' : locale === 'fr' ? 'pro' : 'pro'}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
