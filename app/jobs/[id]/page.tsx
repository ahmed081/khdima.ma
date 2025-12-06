import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Clock,
  Briefcase,
  DollarSign,
  Building2,
  Share2,
  Bookmark,
  ArrowLeft,
  MoreHorizontal,
  ThumbsUp,
  MessageCircle,
  Send,
} from "lucide-react"
import Link from "next/link"

// Mock data - in a real app, this would come from a database
const jobDetails = {
  1: {
    id: 1,
    title: "Développeur Full Stack",
    company: "TechMaroc Solutions",
    location: "Casablanca",
    type: "CDI",
    salary: "12,000 - 18,000 MAD",
    posted: "Il y a 2 jours",
    tags: ["React", "Node.js", "MongoDB"],
    description: `TechMaroc Solutions recherche un développeur Full Stack passionné pour rejoindre notre équipe dynamique à Casablanca. Vous travaillerez sur des projets innovants pour des clients nationaux et internationaux.

Nous offrons un environnement de travail moderne, des opportunités de formation continue et une équipe collaborative.`,
    responsibilities: [
      "Développer et maintenir des applications web full stack",
      "Collaborer avec l'équipe design et produit",
      "Participer aux revues de code et aux décisions techniques",
      "Optimiser les performances des applications",
      "Assurer la qualité du code et les tests",
    ],
    requirements: [
      "3+ années d'expérience en développement Full Stack",
      "Maîtrise de React, Node.js et MongoDB",
      "Expérience avec Git et les méthodologies Agile",
      "Bonnes compétences en communication",
      "Français et Anglais courants",
    ],
    benefits: [
      "Salaire compétitif",
      "Assurance santé",
      "Formation continue",
      "Environnement de travail moderne",
      "Équipe internationale",
    ],
  },
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const job = jobDetails[params.id as keyof typeof jobDetails] || jobDetails[1]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Retour aux offres
        </Link>

        {/* Post Header - Like Facebook */}
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                {/* Company Avatar */}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </div>

                {/* Company Info */}
                <div>
                  <p className="font-semibold text-foreground">{job.company}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>{job.posted}</span>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                  </div>
                </div>
              </div>

              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>

          {/* Post Content */}
          <CardContent className="px-4 pb-3 pt-0">
            <h1 className="mb-2 text-balance text-xl font-bold text-foreground">{job.title}</h1>

            <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-primary" />
                <Badge variant="secondary" className="text-xs">
                  {job.type}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">{job.salary}</span>
              </div>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              {job.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-pretty leading-relaxed text-foreground whitespace-pre-line">{job.description}</p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">Responsabilités :</h3>
                <ul className="space-y-1.5">
                  {job.responsibilities.map((item, index) => (
                    <li key={index} className="flex gap-2 text-muted-foreground">
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">Profil recherché :</h3>
                <ul className="space-y-1.5">
                  {job.requirements.map((item, index) => (
                    <li key={index} className="flex gap-2 text-muted-foreground">
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">Avantages :</h3>
                <ul className="space-y-1.5">
                  {job.benefits.map((item, index) => (
                    <li key={index} className="flex gap-2 text-muted-foreground">
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>

          {/* Engagement Stats - Like Facebook */}
          <CardContent className="border-t px-4 py-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                  <ThumbsUp className="h-2.5 w-2.5 fill-primary-foreground text-primary-foreground" />
                </div>
                <span>24 personnes intéressées</span>
              </div>
              <div className="flex gap-3">
                <span>8 commentaires</span>
                <span>12 partages</span>
              </div>
            </div>
          </CardContent>

          {/* Action Buttons - Like Facebook */}
          <CardContent className="border-t px-4 py-2">
            <div className="grid grid-cols-4 gap-1">
              <Button
                variant="ghost"
                className="flex items-center justify-center gap-2 text-muted-foreground hover:bg-accent"
                size="sm"
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="text-sm font-medium">Intéressé</span>
              </Button>
              <Button
                variant="ghost"
                className="flex items-center justify-center gap-2 text-muted-foreground hover:bg-accent"
                size="sm"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Commenter</span>
              </Button>
              <Button
                variant="ghost"
                className="flex items-center justify-center gap-2 text-muted-foreground hover:bg-accent"
                size="sm"
              >
                <Share2 className="h-4 w-4" />
                <span className="text-sm font-medium">Partager</span>
              </Button>
              <Button
                variant="ghost"
                className="flex items-center justify-center gap-2 text-muted-foreground hover:bg-accent"
                size="sm"
              >
                <Bookmark className="h-4 w-4" />
                <span className="text-sm font-medium">Sauvegarder</span>
              </Button>
            </div>
          </CardContent>

          {/* Apply Button - Prominent CTA */}
          <CardContent className="border-t bg-accent/30 p-4">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
              <Send className="mr-2 h-4 w-4" />
              Postuler maintenant
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
