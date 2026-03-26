'use client'
import { Search, Users, MessageCircle } from "lucide-react"
import { useTranslations } from 'next-intl'
import { useScrollAnimation, animations } from '@/hooks/useScrollAnimation'

export function HowItWorks() {
  const t = useTranslations('howItWorks')
  const { ref, isVisible } = useScrollAnimation()

  const steps = [
    {
      icon: Search,
      title: t('step1Title'),
      description: t('step1Desc'),
      color: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: Users,
      title: t('step2Title'),
      description: t('step2Desc'),
      color: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      icon: MessageCircle,
      title: t('step3Title'),
      description: t('step3Desc'),
      color: 'from-green-500 to-emerald-600',
      bg: 'bg-green-50',
      iconColor: 'text-green-600',
    },
  ]

  return (
    <section ref={ref as any} className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className={`text-center mb-14 ${animations.fadeUp(isVisible)}`}>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">{t('title')}</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">{t('subtitle')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-amber-200 to-green-200" />

          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={index}
                className={`relative text-center ${animations.fadeUp(isVisible, index * 120)}`}
              >
                {/* Step number + icon */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className={`w-20 h-20 rounded-2xl ${step.bg} flex items-center justify-center shadow-sm`}>
                      <Icon className={`h-9 w-9 ${step.iconColor}`} />
                    </div>
                    <div className={`absolute -top-3 -end-3 w-8 h-8 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-sm font-extrabold text-white shadow-lg`}>
                      {index + 1}
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
