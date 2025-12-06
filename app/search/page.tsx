"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Briefcase, DollarSign, Building2, Clock } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [city, setCity] = useState("")
  const [jobType, setJobType] = useState("")
  const [salaryRange, setSalaryRange] = useState("")

  const jobs = [
    {
      id: 1,
      title: "Développeur Full Stack",
      company: "TechCasa",
      location: "Casablanca",
      type: "CDI",
      salary: "12,000 - 18,000 MAD",
      postedAt: "Il y a 2 jours",
      logo: "/tech-company-logo.jpg",
    },
    {
      id: 2,
      title: "Chef de Projet Digital",
      company: "Maroc Telecom",
      location: "Rabat",
      type: "CDI",
      salary: "15,000 - 22,000 MAD",
      postedAt: "Il y a 3 jours",
      logo: "/telecom-logo.png",
    },
    {
      id: 3,
      title: "Comptable Senior",
      company: "Attijariwafa Bank",
      location: "Casablanca",
      type: "CDI",
      salary: "10,000 - 14,000 MAD",
      postedAt: "Il y a 5 jours",
      logo: "/abstract-bank-logo.png",
    },
    {
      id: 4,
      title: "Responsable Marketing",
      company: "Jumia Maroc",
      location: "Casablanca",
      type: "CDI",
      salary: "13,000 - 19,000 MAD",
      postedAt: "Il y a 1 semaine",
      logo: "/ecommerce-logo.png",
    },
    {
      id: 5,
      title: "Ingénieur DevOps",
      company: "OCP Group",
      location: "Casablanca",
      type: "CDI",
      salary: "16,000 - 24,000 MAD",
      postedAt: "Il y a 1 semaine",
      logo: "/industrial-logo.png",
    },
    {
      id: 6,
      title: "Designer UX/UI",
      company: "Inwi",
      location: "Rabat",
      type: "CDD",
      salary: "9,000 - 13,000 MAD",
      postedAt: "Il y a 2 semaines",
      logo: "/generic-mobile-logo.png",
    },
  ]

  return (
    <div className="min-h-screen">
      <Header />
      <main className="bg-muted/20">
        {/* Search filters */}
        <section className="border-b border-border/40 bg-background py-8">
          <div className="container mx-auto px-4">
            <h1 className="mb-6 text-3xl font-bold text-foreground">Rechercher des offres d'emploi</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="flex items-center gap-3 rounded-lg border border-input bg-background px-4 py-3 lg:col-span-2">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Titre du poste, mots-clés..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 bg-transparent p-0 text-base focus-visible:ring-0"
                />
              </div>

              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="bg-background">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Ville" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casablanca">Casablanca</SelectItem>
                  <SelectItem value="rabat">Rabat</SelectItem>
                  <SelectItem value="marrakech">Marrakech</SelectItem>
                  <SelectItem value="tanger">Tanger</SelectItem>
                  <SelectItem value="fes">Fès</SelectItem>
                </SelectContent>
              </Select>

              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger className="bg-background">
                  <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Type de contrat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cdi">CDI</SelectItem>
                  <SelectItem value="cdd">CDD</SelectItem>
                  <SelectItem value="stage">Stage</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>

              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Rechercher</Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Select value={salaryRange} onValueChange={setSalaryRange}>
                <SelectTrigger className="w-[200px] bg-background">
                  <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Salaire" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-5000">0 - 5,000 MAD</SelectItem>
                  <SelectItem value="5000-10000">5,000 - 10,000 MAD</SelectItem>
                  <SelectItem value="10000-15000">10,000 - 15,000 MAD</SelectItem>
                  <SelectItem value="15000+">15,000+ MAD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <p className="mb-6 text-muted-foreground">{jobs.length} offres d'emploi trouvées</p>

            <div className="grid gap-6">
              {jobs.map((job) => (
                <Card key={job.id} className="border-border/50 bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-muted">
                        <img
                          src={job.logo || "/placeholder.svg"}
                          alt={job.company}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <h3 className="mb-2 text-xl font-semibold text-foreground">{job.title}</h3>

                        <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            <span>{job.company}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            <span>{job.type}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{job.salary}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{job.postedAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 md:flex-col">
                      <Link href={`/jobs/${job.id}`} className="flex-1 md:flex-none">
                        <Button variant="outline" className="w-full bg-transparent">
                          Voir l'offre
                        </Button>
                      </Link>
                      <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 md:flex-none">
                        Postuler
                      </Button>
                    </div>
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
