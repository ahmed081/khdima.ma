"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Bookmark } from "lucide-react"
import Link from "next/link"
import { useFeaturedJobs } from "@/hooks/useFeaturedJobs"
import {JobCard} from "@/components/jobs/job-card";

export function FeaturedJobs() {
  const { data: jobs = [], isLoading } = useFeaturedJobs()

  return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-balance text-3xl font-bold md:text-4xl">
              Offres d'emploi récentes
            </h2>
            <p className="text-lg text-muted-foreground">
              Découvrez les dernières opportunités professionnelles au Maroc
            </p>
          </div>

          {isLoading ? (
              <p className="text-center text-muted-foreground">Chargement...</p>
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
                Voir toutes les offres
              </Button>
            </Link>
          </div>
        </div>
      </section>
  )
}
