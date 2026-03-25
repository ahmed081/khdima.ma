import { prisma } from "@/lib/prisma"
import { Link } from "@/i18n/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { getLocale } from "next-intl/server"

const CATEGORY_ICONS: Record<string, string> = {
  plumbing: '🔧', electricity: '⚡', cleaning: '🧹', carpentry: '🪚',
  painting: '🎨', hvac: '❄️', 'car-wash': '🚗', moving: '📦',
  gardening: '🌿', security: '🔒', masonry: '🧱', welding: '⚙️'
}

export default async function ServicesPage() {
  const locale = await getLocale()
  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { providers: true, subcategories: true } }
    }
  })

  const getName = (cat: any) =>
    locale === 'ar' ? cat.nameAr : locale === 'fr' ? cat.nameFr : cat.name

  return (
    <main className="min-h-screen bg-amber-50 py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
          {locale === 'ar' ? 'جميع الخدمات' : locale === 'fr' ? 'Tous les services' : 'All Services'}
        </h1>
        <p className="text-center text-gray-500 mb-10">
          {locale === 'ar' ? 'اختر من بين فئات خدماتنا' : locale === 'fr' ? 'Choisissez parmi nos catégories' : 'Browse our service categories'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
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
    </main>
  )
}
