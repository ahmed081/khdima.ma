export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { getLocale } from "next-intl/server"
import { Star, MapPin, Briefcase, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ReviewForm } from "@/components/review-form"
import { ContactButtons } from "@/components/contact-buttons"
import { ReportButton } from "@/components/report-button"
import { tMany } from "@/lib/translations"
import type { Locale } from "@/lib/translations"
import { Link } from "@/i18n/navigation"

interface Props {
  params: Promise<{ category: string; id: string }>
}

export default async function ProviderProfilePage({ params }: Props) {
  const { id } = await params
  const locale = await getLocale() as Locale

  const provider = await prisma.provider.findUnique({
    where: { id: parseInt(id) },
    include: {
      user:     { select: { name: true, email: true } },
      city:     true,
      category: true,
      subcategories: { include: { subcategory: true } },
      reviews: {
        where: { isVisible: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { name: true } } }
      },
      portfolioImages: { orderBy: [{ order: 'asc' }] }
    }
  })

  if (!provider || provider.status !== 'ACTIVE') notFound()

  // Translate names
  const catCode     = `CAT_${provider.category.code}`
  const subcatCodes = provider.subcategories.map(ps => `SUBCAT_${ps.subcategory.code}`)
  const translations = await tMany([catCode, ...subcatCodes], locale)

  // Fire-and-forget profile view increment
  prisma.provider.update({
    where: { id: provider.id },
    data: { profileViews: { increment: 1 } }
  }).catch(() => {})

  const cityName = locale === 'ar' ? provider.city.nameAr : locale === 'fr' ? provider.city.nameFr : provider.city.name
  const catName  = translations[catCode] ?? provider.category.code
  const bio      = locale === 'ar' ? (provider.bioAr ?? provider.bio) : locale === 'fr' ? (provider.bioFr ?? provider.bio) : provider.bio

  const availabilityColor = provider.availability === 'AVAILABLE'
    ? 'bg-green-100 text-green-700'
    : provider.availability === 'BUSY'
    ? 'bg-yellow-100 text-yellow-700'
    : 'bg-gray-100 text-gray-600'

  const availabilityLabel =
    provider.availability === 'AVAILABLE'
      ? (locale === 'ar' ? 'متاح' : locale === 'fr' ? 'Disponible' : 'Available')
      : provider.availability === 'BUSY'
      ? (locale === 'ar' ? 'مشغول' : locale === 'fr' ? 'Occupé' : 'Busy')
      : (locale === 'ar' ? 'غير نشط' : locale === 'fr' ? 'Inactif' : 'Inactive')

  const isRTL = locale === 'ar'

  return (
    <main className="min-h-screen bg-gray-50 py-10" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/services" className="hover:text-green-700">
            {locale === 'ar' ? 'الخدمات' : locale === 'fr' ? 'Services' : 'Services'}
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/services/${provider.category.slug}`} className="hover:text-green-700">{catName}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{provider.businessName}</span>
        </nav>

        {/* Header card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-4xl font-bold text-green-700 flex-shrink-0 overflow-hidden">
                {provider.avatarUrl
                  ? <img src={provider.avatarUrl} className="w-full h-full object-cover" alt={provider.businessName} />
                  : provider.businessName?.[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{provider.businessName}</h1>
                  {provider.isVerified && (
                    <Badge className="bg-green-100 text-green-700">
                      <Shield className="h-3 w-3 mr-1" />
                      {locale === 'fr' ? 'Vérifié' : locale === 'ar' ? 'موثوق' : 'Verified'}
                    </Badge>
                  )}
                  <Badge className={availabilityColor}>{availabilityLabel}</Badge>
                </div>
                <p className="text-gray-600 mb-2">{catName}</p>

                {/* Subcategories */}
                {provider.subcategories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {provider.subcategories.map(ps => (
                      <span key={ps.subcategoryId} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {translations[`SUBCAT_${ps.subcategory.code}`] ?? ps.subcategory.code}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(provider.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                  ))}
                  <span className="text-sm text-gray-500 ml-1">
                    ({provider.reviewCount} {locale === 'fr' ? 'avis' : locale === 'ar' ? 'تقييم' : 'reviews'})
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                  <MapPin className="h-3 w-3" />{cityName}
                </div>
                {provider.yearsExperience && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Briefcase className="h-3 w-3" />
                    {provider.yearsExperience} {locale === 'fr' ? "ans d'expérience" : locale === 'ar' ? 'سنوات خبرة' : 'years experience'}
                  </div>
                )}
              </div>
            </div>

            {/* Contact buttons */}
            <ContactButtons
              providerId={provider.id}
              phone={provider.phone}
              whatsapp={provider.whatsapp}
            />
            <div className="mt-3 flex justify-end">
              <ReportButton providerId={provider.id} />
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        {bio && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-3 text-gray-800">
                {locale === 'fr' ? 'À propos' : locale === 'ar' ? 'نبذة عني' : 'About'}
              </h2>
              <p className="text-gray-600 leading-relaxed">{bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Portfolio */}
        {provider.portfolioImages.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-4 text-gray-800">
                {locale === 'fr' ? 'Portfolio' : locale === 'ar' ? 'معرض الأعمال' : 'Portfolio'}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {provider.portfolioImages.map(img => (
                  <div key={img.id} className="aspect-square rounded overflow-hidden bg-gray-100 relative group">
                    <img src={img.url} alt={img.caption ?? ''} className="w-full h-full object-cover" />
                    {img.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {img.caption}
                      </div>
                    )}
                    {img.isBefore && (
                      <span className="absolute top-1 left-1 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded">
                        {locale === 'ar' ? 'قبل' : locale === 'fr' ? 'Avant' : 'Before'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews */}
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg mb-4 text-gray-800">
              {locale === 'fr' ? 'Avis clients' : locale === 'ar' ? 'تقييمات العملاء' : 'Customer Reviews'}
            </h2>

            {provider.reviews.length === 0 ? (
              <p className="text-gray-500 text-sm mb-6">
                {locale === 'fr' ? 'Aucun avis pour le moment' : locale === 'ar' ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
              </p>
            ) : (
              <div className="space-y-4 mb-8">
                {provider.reviews.map(review => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-800">{review.user.name}</span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-MA' : 'en-US')}
                      </span>
                    </div>
                    {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}

            <div className="border-t pt-6">
              <ReviewForm providerId={provider.id} />
            </div>
          </CardContent>
        </Card>

      </div>
    </main>
  )
}
