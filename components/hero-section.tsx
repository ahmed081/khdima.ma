'use client'
import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ArrowRight, CheckCircle } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

export function HeroSection() {
  const t      = useTranslations('home')
  const locale = useLocale()
  const router = useRouter()
  const [query, setQuery] = useState('')

  const badges = [
    t('badge1') || (locale === 'ar' ? 'محترفون موثوقون' : locale === 'fr' ? 'Pros vérifiés' : 'Verified pros'),
    t('badge2') || (locale === 'ar' ? 'بدون وسيط' : locale === 'fr' ? 'Sans intermédiaire' : 'No middleman'),
    t('badge3') || (locale === 'ar' ? 'مجاني للعملاء' : locale === 'fr' ? 'Gratuit pour clients' : 'Free for clients'),
  ]

  return (
    <section className="relative min-h-[560px] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <img
          src="/casablanca-skyline-at-sunset-with-modern-office-bu.jpg"
          alt="Casablanca"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/75" />
        {/* Subtle overlay pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className="relative container mx-auto px-4 text-center text-white py-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium text-white/90 mb-6">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          {locale === 'ar' ? 'المنصة المغربية الأولى للمحترفين' : locale === 'fr' ? 'La 1ère plateforme marocaine de pros' : 'Morocco\'s #1 professional services platform'}
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight tracking-tight">
          {t('heroTitle')}
        </h1>
        <p className="text-lg md:text-xl mb-10 text-white/75 max-w-2xl mx-auto leading-relaxed">
          {t('heroSubtitle')}
        </p>

        {/* Search bar */}
        <div className="flex max-w-2xl mx-auto gap-2 mb-8">
          <div className="relative flex-1">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <Input
              className="bg-white text-gray-900 h-14 text-base ps-12 pe-4 rounded-xl border-0 shadow-lg focus-visible:ring-2 focus-visible:ring-green-400"
              placeholder={t('searchPlaceholder')}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && router.push(`/services?q=${query}`)}
            />
          </div>
          <Button
            size="lg"
            className="h-14 px-7 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl shadow-lg text-base"
            onClick={() => router.push(`/services?q=${query}`)}
          >
            <Search className="h-5 w-5 me-2" />
            {locale === 'ar' ? 'بحث' : locale === 'fr' ? 'Chercher' : 'Search'}
          </Button>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {badges.map((badge, i) => (
            <span key={i} className="flex items-center gap-1.5 text-sm text-white/80">
              <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" className="w-full fill-white" preserveAspectRatio="none">
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
        </svg>
      </div>
    </section>
  )
}
