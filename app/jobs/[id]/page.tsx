import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Clock,
  Briefcase,
  DollarSign,
  Building2,
  ArrowLeft,
  MoreHorizontal,
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark,
  Send,
} from "lucide-react"

export default async function JobDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const jobId = Number(id)

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      employer: true,
      skills: true,
    },
  })

  if (!job) {
    return (
        <div className="p-10 text-center text-red-500">
          Offre introuvable.
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Retour aux offres
          </Link>

          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-semibold text-foreground">{job.employer.companyName ?? "Entreprise"}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>Publié le {job.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>

            <CardContent className="px-4 pb-3 pt-0">
              <h1 className="mb-2 text-xl font-bold text-foreground">{job.title}</h1>

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

                {job.salary && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{job.salary}</span>
                    </div>
                )}
              </div>

              <div className="mb-3 flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                    <Badge key={skill.id} variant="outline" className="text-xs">
                      {skill.name}
                    </Badge>
                ))}
              </div>

              <div className="space-y-4 text-sm">
                <p className="text-pretty leading-relaxed whitespace-pre-line text-foreground">
                  {job.description}
                </p>

                <div>
                  <h3 className="mb-2 font-semibold">Responsabilités :</h3>
                  <ul className="space-y-1.5">
                    {job.responsibilities.map((item, index) => (
                        <li key={index} className="flex gap-2 text-muted-foreground">
                          <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
                          <span>{item}</span>
                        </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">Profil recherché :</h3>
                  <ul className="space-y-1.5">
                    {job.requirements.map((item, index) => (
                        <li key={index} className="flex gap-2 text-muted-foreground">
                          <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
                          <span>{item}</span>
                        </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">Avantages :</h3>
                  <ul className="space-y-1.5">
                    {job.benefits.map((item, index) => (
                        <li key={index} className="flex gap-2 text-muted-foreground">
                          <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
                          <span>{item}</span>
                        </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>

            {/* CTA */}
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
