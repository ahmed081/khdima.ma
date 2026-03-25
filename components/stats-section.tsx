import { Users, Briefcase, Building2, TrendingUp } from "lucide-react"
import { useTranslations } from 'next-intl'

export function StatsSection() {
  const t = useTranslations('stats')

  const stats = [
    {
      icon: Briefcase,
      value: "5,000+",
      label: t('activeJobs'),
    },
    {
      icon: Users,
      value: "50,000+",
      label: t('candidates'),
    },
    {
      icon: Building2,
      value: "1,200+",
      label: t('companies'),
    },
    {
      icon: TrendingUp,
      value: "85%",
      label: t('satisfaction'),
    },
  ]

  return (
    <section className="border-b border-border/40 bg-muted/30 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="text-center">
                <div className="mb-3 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="mb-1 text-3xl font-bold text-foreground md:text-4xl">{stat.value}</div>
                <div className="text-sm text-muted-foreground md:text-base">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
