"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Bookmark } from "lucide-react"
import Link from "next/link"
import { useFeaturedJobs } from "@/hooks/useFeaturedJobs"

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
                    <Card key={job.id} className="group transition-all hover:shadow-lg">
                      <CardContent className="p-6">

                        {/* Header */}
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="mb-2 text-lg font-semibold group-hover:text-primary">
                              {job.title}
                            </h3>
                            <p className="mb-3 text-sm text-muted-foreground">
                              {job.employer?.companyName ?? "Entreprise"}
                            </p>
                          </div>
                          <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-muted-foreground hover:text-primary"
                          >
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Meta Info */}
                        <div className="mb-4 space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{job.city?.name ?? "—"}</span>
                            <span className="mx-1">•</span>

                            <Badge variant="secondary" className="text-xs">
                              {job.contractType?.name ?? "Contrat"}
                            </Badge>
                          </div>

                          {job.salary && (
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <span>{job.salary}</span>
                              </div>
                          )}

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="mb-4 flex flex-wrap gap-2">
                          {job.skills.map(js => (
                              <Badge key={js.skill.id} variant="outline" className="text-xs">
                                {js.skill.name}
                              </Badge>
                          ))}
                        </div>

                        {/* CTA */}
                        <Link href={`/jobs/${job.id}`}>
                          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                            Voir l'offre
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
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
