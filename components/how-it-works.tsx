import { Search, Users, MessageCircle } from "lucide-react"
import { useTranslations } from 'next-intl'

export function HowItWorks() {
  const t = useTranslations('howItWorks')

  const steps = [
    {
      icon: Search,
      title: t('step1Title'),
      description: t('step1Desc'),
    },
    {
      icon: Users,
      title: t('step2Title'),
      description: t('step2Desc'),
    },
    {
      icon: MessageCircle,
      title: t('step3Title'),
      description: t('step3Desc'),
    },
  ]

  return (
    <section className="border-t border-border/40 bg-muted/30 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold text-foreground md:text-4xl">{t('title')}</h2>
          <p className="text-pretty text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative text-center">
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                      <Icon className="h-10 w-10 text-red-700" />
                    </div>
                    <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-700 text-sm font-bold text-white">
                      {index + 1}
                    </div>
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="text-pretty text-sm text-muted-foreground">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
