"use client"

import { Button } from "@/components/ui/button"
import {Link} from "@/i18n/navigation"
import { useFeaturedJobs } from "@/hooks/useFeaturedJobs"
import {JobCard} from "@/components/jobs/job-card"
import { useTranslations } from 'next-intl'

export function FeaturedJobs() {
  const { data: jobs = [], isLoading } = useFeaturedJobs()
  const t = useTranslations('featuredJobs')

  return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-balance text-3xl font-bold md:text-4xl">
              {t('title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>

          {isLoading ? (
              <p className="text-center text-muted-foreground">{t('loading')}</p>
          ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {jobs.map(job => (
                          <JobCard key={job.id} job={job} />
                      ))}
              </div>
          )}

          <div className="mt-12 text-center">
            <Link href="/search">
              <Button
                  variant="outline"
                  size="lg"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                {t('viewAll')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
  )
}
