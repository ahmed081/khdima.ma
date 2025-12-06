import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Bookmark } from "lucide-react"
import Link from "next/link"

const jobs = [
  {
    id: 1,
    title: "Développeur Full Stack",
    company: "TechMaroc Solutions",
    location: "Casablanca",
    type: "CDI",
    salary: "12,000 - 18,000 MAD",
    posted: "Il y a 2 jours",
    tags: ["React", "Node.js", "MongoDB"],
  },
  {
    id: 2,
    title: "Responsable Commercial",
    company: "Atlas Trading",
    location: "Rabat",
    type: "CDI",
    salary: "10,000 - 15,000 MAD",
    posted: "Il y a 3 jours",
    tags: ["Vente", "B2B", "Négociation"],
  },
  {
    id: 3,
    title: "Chef de Projet Digital",
    company: "Digital Maroc",
    location: "Marrakech",
    type: "CDI",
    salary: "15,000 - 22,000 MAD",
    posted: "Il y a 5 jours",
    tags: ["Gestion", "Marketing", "Agile"],
  },
  {
    id: 4,
    title: "Comptable Senior",
    company: "Finance Plus",
    location: "Tanger",
    type: "CDI",
    salary: "9,000 - 13,000 MAD",
    posted: "Il y a 1 semaine",
    tags: ["Comptabilité", "Fiscalité", "SAP"],
  },
  {
    id: 5,
    title: "Designer UI/UX",
    company: "Creative Studio",
    location: "Casablanca",
    type: "Freelance",
    salary: "8,000 - 12,000 MAD",
    posted: "Il y a 1 semaine",
    tags: ["Figma", "Design", "Prototypage"],
  },
  {
    id: 6,
    title: "Ingénieur DevOps",
    company: "Cloud Systems",
    location: "Rabat",
    type: "CDI",
    salary: "16,000 - 24,000 MAD",
    posted: "Il y a 2 semaines",
    tags: ["AWS", "Docker", "Kubernetes"],
  },
]

export function FeaturedJobs() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold text-foreground md:text-4xl">Offres d'emploi récentes</h2>
          <p className="text-pretty text-lg text-muted-foreground">
            Découvrez les dernières opportunités professionnelles au Maroc
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job.id} className="group transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-2 text-balance text-lg font-semibold text-foreground group-hover:text-primary">
                      {job.title}
                    </h3>
                    <p className="mb-3 text-sm font-medium text-muted-foreground">{job.company}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                    <span className="mx-1">•</span>
                    <Badge variant="secondary" className="text-xs">
                      {job.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <span>{job.salary}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{job.posted}</span>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  {job.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <Link href={`/jobs/${job.id}`}>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Voir l'offre
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            variant="outline"
            size="lg"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
          >
            Voir toutes les offres
          </Button>
        </div>
      </div>
    </section>
  )
}
