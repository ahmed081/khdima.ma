import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { getLocale } from "next-intl/server"
import { ProviderCard } from "@/components/provider-card"

interface Props {
  params: Promise<{ category: string; locale: string }>
  searchParams: Promise<{ cityId?: string; minRating?: string; availability?: string; page?: string }>
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params
  const sp = await searchParams
  const locale = await getLocale()

  const cat = await prisma.serviceCategory.findUnique({
    where: { slug: category, isActive: true }
  })
  if (!cat) notFound()

  const page = parseInt(sp.page ?? '1')
  const limit = 12
  const skip = (page - 1) * limit

  const where: any = {
    categoryId: cat.id,
    status: 'ACTIVE'
  }
  if (sp.cityId) where.cityId = parseInt(sp.cityId)
  if (sp.availability) where.availability = sp.availability
  if (sp.minRating) where.rating = { gte: parseFloat(sp.minRating) }

  const [providers, total] = await Promise.all([
    prisma.provider.findMany({
      where,
      skip,
      take: limit,
      orderBy: { rating: 'desc' },
      include: {
        user: { select: { name: true } },
        city: true,
        category: true,
        _count: { select: { reviews: true } }
      }
    }),
    prisma.provider.count({ where })
  ])

  const cities = await prisma.city.findMany({ orderBy: { name: 'asc' } })

  const catName = locale === 'ar' ? cat.nameAr : locale === 'fr' ? cat.nameFr : cat.name

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">{catName}</h1>
        <p className="text-gray-500 mb-8">
          {total} {locale === 'ar' ? 'محترف متاح' : locale === 'fr' ? `professionnel(s) trouvé(s)` : 'provider(s) found'}
        </p>

        {/* Filters */}
        <form method="GET" className="flex flex-wrap gap-3 mb-8">
          <select name="cityId" defaultValue={sp.cityId ?? ''} className="border rounded px-3 py-2 text-sm bg-white">
            <option value="">{locale === 'ar' ? 'كل المدن' : locale === 'fr' ? 'Toutes les villes' : 'All cities'}</option>
            {cities.map(c => (
              <option key={c.id} value={c.id}>
                {locale === 'ar' ? c.nameAr : locale === 'fr' ? c.nameFr : c.name}
              </option>
            ))}
          </select>
          <select name="availability" defaultValue={sp.availability ?? ''} className="border rounded px-3 py-2 text-sm bg-white">
            <option value="">{locale === 'ar' ? 'الجميع' : locale === 'fr' ? 'Tous' : 'All'}</option>
            <option value="AVAILABLE">{locale === 'ar' ? 'متاح' : locale === 'fr' ? 'Disponible' : 'Available'}</option>
            <option value="BUSY">{locale === 'ar' ? 'مشغول' : locale === 'fr' ? 'Occupé' : 'Busy'}</option>
          </select>
          <select name="minRating" defaultValue={sp.minRating ?? ''} className="border rounded px-3 py-2 text-sm bg-white">
            <option value="">{locale === 'ar' ? 'أي تقييم' : locale === 'fr' ? 'Toute note' : 'Any rating'}</option>
            <option value="4">4+</option>
            <option value="3">3+</option>
          </select>
          <button type="submit" className="bg-red-700 text-white px-4 py-2 rounded text-sm hover:bg-red-600">
            {locale === 'ar' ? 'تصفية' : locale === 'fr' ? 'Filtrer' : 'Filter'}
          </button>
        </form>

        {providers.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            {locale === 'ar' ? 'لا يوجد محترفون في هذه الفئة حاليا' : locale === 'fr' ? 'Aucun professionnel trouvé' : 'No providers found'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {providers.map(provider => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
