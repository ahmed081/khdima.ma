'use client'
import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function HeroSection() {
  const t = useTranslations('home')
  const router = useRouter()
  const [query, setQuery] = useState('')

  return (
    <section className="relative min-h-[500px] flex items-center justify-center overflow-hidden">
      {/* Casablanca background image */}
      <div className="absolute inset-0 -z-10">
        <img src="/casablanca-skyline-at-sunset-with-modern-office-bu.jpg" alt="Casablanca" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      </div>
      <div className="relative container mx-auto px-4 text-center text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">{t('heroTitle')}</h1>
        <p className="text-xl md:text-2xl mb-10 text-white/80">{t('heroSubtitle')}</p>
        <div className="flex max-w-xl mx-auto gap-2">
          <Input
            className="bg-white text-gray-900 h-14 text-lg"
            placeholder={t('searchPlaceholder')}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && router.push(`/services?q=${query}`)}
          />
          <Button size="lg" className="h-14 px-6 bg-amber-500 hover:bg-amber-400 text-white" onClick={() => router.push(`/services?q=${query}`)}>
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  )
}
