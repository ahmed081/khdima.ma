import { Link } from "@/i18n/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { getLocale, getTranslations } from "next-intl/server"
import { getCategoriesWithTranslations } from "@/lib/translations"

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function ServicesPage({ searchParams }: Props) {
  const [locale, t, sp] = await Promise.all([getLocale(), getTranslations('home'), searchParams])
  const categories = await getCategoriesWithTranslations(locale as 'fr' | 'en' | 'ar')
  const q = sp.q

  return (
    <main className="min-h-screen bg-amber-50 py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
          {locale === 'ar' ? 'جميع الخدمات' : locale === 'fr' ? 'Tous les services' : 'All Services'}
        </h1>
        <p className="text-center text-gray-500 mb-10">
          {t('categoriesSubtitle')}
        </p>

        {/* If user searched, show a search results note */}
        {q && (
          <p className="text-center text-sm text-gray-500 mb-6">
            {locale === 'ar'
              ? `نتائج البحث عن: "${q}"`
              : locale === 'fr'
              ? `Résultats pour : "${q}"`
              : `Results for: "${q}"`}
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link key={cat.id} href={q ? `/services/${cat.slug}?q=${encodeURIComponent(q)}` : `/services/${cat.slug}`}>
              <Card className="hover:shadow-lg hover:border-green-300 transition-all cursor-pointer group h-full">
                <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-4xl mb-2">{cat.icon ?? '🔨'}</span>
                  <p className="font-semibold text-sm text-gray-800 group-hover:text-green-700">{cat.name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {/* provider count omitted here since getCategoriesWithTranslations doesn't include it */}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
