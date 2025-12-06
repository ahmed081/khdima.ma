"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, Users, Briefcase, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function EmployerDashboard() {
  const myOffers = [
    {
      id: 1,
      title: "Développeur Full Stack",
      status: "active",
      applicants: 24,
      views: 156,
      postedAt: "Il y a 2 jours",
    },
    {
      id: 2,
      title: "Designer UX/UI",
      status: "active",
      applicants: 18,
      views: 98,
      postedAt: "Il y a 5 jours",
    },
    {
      id: 3,
      title: "Chef de Projet",
      status: "closed",
      applicants: 42,
      views: 234,
      postedAt: "Il y a 3 semaines",
    },
  ]

  const recentApplicants = [
    {
      id: 1,
      name: "Youssef Bennani",
      position: "Développeur Full Stack",
      appliedAt: "Il y a 2 heures",
      status: "new",
    },
    {
      id: 2,
      name: "Fatima Zahra El Amrani",
      position: "Développeur Full Stack",
      appliedAt: "Il y a 5 heures",
      status: "reviewed",
    },
    {
      id: 3,
      name: "Ahmed Tazi",
      position: "Designer UX/UI",
      appliedAt: "Il y a 1 jour",
      status: "new",
    },
    {
      id: 4,
      name: "Salma Idrissi",
      position: "Designer UX/UI",
      appliedAt: "Il y a 2 jours",
      status: "reviewed",
    },
  ]

  return (
    <div className="min-h-screen">
      <Header />
      <main className="bg-muted/20 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground">Tableau de bord employeur</h1>
              <p className="text-muted-foreground">Gérez vos offres et consultez les candidatures</p>
            </div>
            <Link href="/post-job">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Publier une offre
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <Card className="border-border/50 bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Offres actives</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">2</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="border-border/50 bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Candidatures totales</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">84</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <Users className="h-6 w-6 text-accent" />
                </div>
              </div>
            </Card>

            <Card className="border-border/50 bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vues totales</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">488</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </Card>
          </div>

          <Tabs defaultValue="offers" className="space-y-6">
            <TabsList className="bg-muted">
              <TabsTrigger value="offers">Mes offres</TabsTrigger>
              <TabsTrigger value="applicants">Candidatures</TabsTrigger>
            </TabsList>

            <TabsContent value="offers" className="space-y-4">
              {myOffers.map((offer) => (
                <Card key={offer.id} className="border-border/50 bg-card p-6 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-foreground">{offer.title}</h3>
                        <Badge
                          variant={offer.status === "active" ? "default" : "secondary"}
                          className={offer.status === "active" ? "bg-green-500/10 text-green-700" : ""}
                        >
                          {offer.status === "active" ? "Active" : "Fermée"}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{offer.applicants} candidatures</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{offer.views} vues</span>
                        </div>
                        <span>Publié {offer.postedAt}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/jobs/${offer.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 bg-transparent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="applicants" className="space-y-4">
              {recentApplicants.map((applicant) => (
                <Card key={applicant.id} className="border-border/50 bg-card p-6 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-foreground">{applicant.name}</h3>
                        <Badge
                          variant={applicant.status === "new" ? "default" : "secondary"}
                          className={applicant.status === "new" ? "bg-blue-500/10 text-blue-700" : ""}
                        >
                          {applicant.status === "new" ? "Nouveau" : "Consulté"}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>Poste: {applicant.position}</span>
                        <span>Candidature envoyée {applicant.appliedAt}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Voir le profil
                      </Button>
                      <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                        Contacter
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}
