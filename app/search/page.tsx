"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Building2,
  Clock
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { searchJobs } from "@/queries/jobs"

export default function SearchPage() {
  const [filters, setFilters] = useState({
    search: "",
    city: "",
    jobType: "",
    salaryRange: ""
  })

  const { data: jobs = [], isLoading, refetch } = useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => searchJobs(filters),
  })

  function updateFilter(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
      <div className="min-h-screen">
        <Header />

        <main className="bg-muted/20">

          {/* Filters */}
          <section className="border-b bg-background py-8">
            <div className="container mx-auto px-4">
              <h1 className="mb-6 text-3xl font-bold">Rechercher des offres d'emploi</h1>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div className="flex items-center gap-3 rounded-lg border px-4 py-3 lg:col-span-2">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <Input
                      placeholder="Titre du poste..."
                      value={filters.search}
                      onChange={(e) => updateFilter("search", e.target.value)}
                      className="border-0 bg-transparent p-0"
                  />
                </div>

                <Select value={filters.city} onValueChange={(v) => updateFilter("city", v)}>
                  <SelectTrigger>
                    <MapPin className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Ville" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Casablanca">Casablanca</SelectItem>
                    <SelectItem value="Rabat">Rabat</SelectItem>
                    <SelectItem value="Marrakech">Marrakech</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.jobType} onValueChange={(v) => updateFilter("jobType", v)}>
                  <SelectTrigger>
                    <Briefcase className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Contrat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">CDI</SelectItem>
                    <SelectItem value="PART_TIME">CDD</SelectItem>
                    <SelectItem value="INTERNSHIP">Stage</SelectItem>
                  </SelectContent>
                </Select>

                {/* Button triggers refetch */}
                <Button onClick={() => refetch()}>Rechercher</Button>
              </div>

              {/* Salary */}
              <div className="mt-4">
                <Select
                    value={filters.salaryRange}
                    onValueChange={(v) => updateFilter("salaryRange", v)}
                >
                  <SelectTrigger className="w-[200px]">
                    <DollarSign className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Salaire" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-5000">0 - 5,000 MAD</SelectItem>
                    <SelectItem value="5000-10000">5,000 - 10,000 MAD</SelectItem>
                    <SelectItem value="10000-15000">10,000 - 15,000 MAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Results */}
          <section className="py-12">
            <div className="container mx-auto px-4">

              {isLoading ? (
                  <p className="text-muted-foreground">Chargement...</p>
              ) : (
                  <p className="text-muted-foreground">{jobs.length} offres trouvées</p>
              )}

              <div className="grid gap-6 mt-6">
                {jobs.map((job: any) => (
                    <Card key={job.id} className="p-6">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">{job.title}</h3>
                          <p className="text-muted-foreground">{job.location}</p>
                          <p className="text-sm">{job.salary}</p>
                        </div>

                        <Link href={`/jobs/${job.id}`}>
                          <Button variant="outline">Voir l'offre</Button>
                        </Link>
                      </div>
                    </Card>
                ))}
              </div>
            </div>
          </section>

        </main>

        <Footer />
      </div>
  )
}
