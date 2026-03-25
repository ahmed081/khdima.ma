import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { getLocale } from "next-intl/server"
import { ProviderCard } from "@/components/provider-card"
import { t as getTranslation, tMany } from "@/lib/translations"
import type { Locale } from "@/lib/translations"
import { Link } from "@/i18n/navigation"

interface Props {
  params: Promise<{ category: string; locale: string }>
  searchParams: Promise<{ cityId?: string; minRating?: string; availability?: string; page?: string; q?: string }>
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: slug } = await params
  const sp     = await searchParams
  const locale = await getLocale() as Locale

  const cat = await prisma.serviceCategory.findUnique({ where: { slug, isActive: true } })
  if (!cat) notFound()

  const page  = parseInt(sp.page ?? '1')
  const limit = 12
  const skip  = (page - 1) * limit
  const q     = sp.q?.trim()

  const where: any = { categoryId: cat.id, status: 'ACTIVE' }
  if (sp.cityId)      where.cityId       = parseInt(sp.cityId)
  if (sp.availability) where.availability = sp.availability
  if (sp.minRating)   where.rating       = { gte: parseFloat(sp.minRating) }
  if (q) {
    where.OR = [
      { businessName: { contains: q, mode: 'insensitive' } },
      { bio:          { contains: q, mode: 'insensitive' } },
      { bioFr:        { contains: q, mode: 'insensitive' } },
      { city: { nameFr: { contains: q, mode: 'insensitive' } } },
      { city: { nameAr: { contains: q, mode: 'insensitive' } } },
    ]
  }

  const [providers, total, cities] = await Promise.all([
    prisma.provider.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
      include: { city: true, category: true }
    }),
    prisma.provider.count({ where }),
    prisma.city.findMany({ orderBy: { name: 'asc' } }),
  ])

  // Translate category and provider categories
  const catCodes = [...new Set(providers.map(p => `CAT_${p.category.code}`)), `CAT_${cat.code}`]
  const translations = await tMany(catCodes, locale)
  const catName = translations[`CAT_${cat.code}`] ?? cat.code

  const providerList = providers.map(p => ({
    id:              p.id,
    businessName:    p.businessName,
    avatarUrl:       p.avatarUrl,
    rating:          p.rating,
    reviewCount:     p.reviewCount,
    isVerified:      p.isVerified,
    availability:    p.availability,
    phone:           p.phone,
    whatsapp:        p.whatsapp,
    city: {
      id:   p.city.id,
      code: p.city.code,
      name: locale === 'ar' ? p.city.nameAr : locale === 'fr' ? p.city.nameFr : p.city.name,
    },
    category: {
      id:   p.category.id,
      code: p.category.code,
      slug: p.category.slug,
      icon: p.category.icon,
      name: translations[`CAT_${p.category.code}`] ?? p.category.code,
    },
  }))

  const totalPages = Math.ceil(total / limit)
  const isRTL = locale === 'ar'

  const filterLabel = (key: string) =>
    key === 'allCities'    ? (locale === 'ar' ? 'كل المدن'  : locale === 'fr' ? 'Toutes les villes' : 'All cities') :
    key === 'all'          ? (locale === 'ar' ? 'الجميع'    : locale === 'fr' ? 'Tous'               : 'All') :
    key === 'available'    ? (locale === 'ar' ? 'متاح'      : locale === 'fr' ? 'Disponible'         : 'Available') :
    key === 'busy'         ? (locale === 'ar' ? 'مشغول'     : locale === 'fr' ? 'Occupé'             : 'Busy') :
    key === 'anyRating'    ? (locale === 'ar' ? 'أي تقييم'  : locale === 'fr' ? 'Toute note'         : 'Any rating') :
    key === 'filter'       ? (locale === 'ar' ? 'تصفية'     : locale === 'fr' ? 'Filtrer'            : 'Filter') :
    key === 'noResults'    ? (locale === 'ar' ? 'لا يوجد محترفون في هذه الفئة' : locale === 'fr' ? 'Aucun professionnel trouvé' : 'No providers found') :
    key === 'providers'    ? (locale === 'ar' ? 'محترف متاح' : locale === 'fr' ? 'professionnel(s)' : 'provider(s)') : key

  return (
    <main className="min-h-screen bg-gray-50 py-10" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/services" className="hover:text-green-700">
            {locale === 'ar' ? 'الخدمات' : locale === 'fr' ? 'Services' : 'Services'}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{catName}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-1 text-gray-900">{catName}</h1>
        <p className="text-gray-500 mb-8">
          {total} {filterLabel('providers')}
          {q && ` — "${q}"`}
        </p>

        {/* Filters */}
        <form method="GET" className="flex flex-wrap gap-3 mb-8">
          {q && <input type="hidden" name="q" value={q} />}

          <select name="cityId" defaultValue={sp.cityId ?? ''} className="border rounded px-3 py-2 text-sm bg-white">
            <option value="">{filterLabel('allCities')}</option>
            {cities.map(c => (
              <option key={c.id} value={c.id}>
                {locale === 'ar' ? c.nameAr : locale === 'fr' ? c.nameFr : c.name}
              </option>
            ))}
          </select>

          <select name="availability" defaultValue={sp.availability ?? ''} className="border rounded px-3 py-2 text-sm bg-white">
            <option value="">{filterLabel('all')}</option>
            <option value="AVAILABLE">{filterLabel('available')}</option>
            <option value="BUSY">{filterLabel('busy')}</option>
          </select>

          <select name="minRating" defaultValue={sp.minRating ?? ''} className="border rounded px-3 py-2 text-sm bg-white">
            <option value="">{filterLabel('anyRating')}</option>
            <option value="4">4★+</option>
            <option value="3">3★+</option>
          </select>

          <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded text-sm hover:bg-green-600">
            {filterLabel('filter')}
          </button>
        </form>

        {providerList.length === 0 ? (
          <div className="text-center text-gray-500 py-20">{filterLabel('noResults')}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {providerList.map(provider => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pg = i + 1
                  const href = `?${new URLSearchParams({
                    ...(sp.cityId      && { cityId: sp.cityId }),
                    ...(sp.availability && { availability: sp.availability }),
                    ...(sp.minRating   && { minRating: sp.minRating }),
                    ...(q              && { q }),
                    page: String(pg),
                  }).toString()}`
                  return (
                    <a
                      key={pg}
                      href={href}
                      className={`w-9 h-9 flex items-center justify-center rounded text-sm font-medium border ${pg === page ? 'bg-green-700 text-white border-green-700' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                    >
                      {pg}
                    </a>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
