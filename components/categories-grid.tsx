'use client'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'

const CATEGORY_ICONS: Record<string, string> = {
  plumbing: '🔧', electricity: '⚡', cleaning: '🧹', carpentry: '🪚',
  painting: '🎨', hvac: '❄️', 'car-wash': '🚗', moving: '📦',
  gardening: '🌿', security: '🔒', masonry: '🧱', welding: '⚙️'
}

export function CategoriesGrid() {
  const t = useTranslations('home')
  const locale = useLocale()
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then(r => r.json())
  })

  const getName = (cat: any) => locale === 'ar' ? cat.nameAr : locale === 'fr' ? cat.nameFr : cat.name

  return (
    <section className="py-16 bg-amber-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">{t('popularCategories')}</h2>
        <p className="text-center text-gray-500 mb-10">{t('categoriesSubtitle')}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat: any) => (
            <Link key={cat.id} href={`/services/${cat.slug}`}>
              <Card className="hover:shadow-lg hover:border-red-300 transition-all cursor-pointer group h-full">
                <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-4xl mb-2">{CATEGORY_ICONS[cat.slug] ?? '🔨'}</span>
                  <p className="font-semibold text-sm text-gray-800 group-hover:text-red-700">{getName(cat)}</p>
                  <p className="text-xs text-gray-400 mt-1">{cat._count?.providers ?? 0}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
