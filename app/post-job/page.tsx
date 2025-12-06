"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Briefcase, ArrowLeft } from "lucide-react"

export default function PostJobPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Briefcase className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Khidma.ma</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
        </div>

        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Publier une offre d'emploi</CardTitle>
              <CardDescription>
                Remplissez les détails de votre offre pour attirer les meilleurs candidats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="job-title">Titre du poste *</Label>
                    <Input id="job-title" placeholder="Ex: Développeur Full Stack" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Entreprise *</Label>
                    <Input id="company" placeholder="Nom de votre entreprise" required />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">Ville *</Label>
                    <Select>
                      <SelectTrigger id="location" className="w-full">
                        <SelectValue placeholder="Sélectionnez une ville" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="casablanca">Casablanca</SelectItem>
                        <SelectItem value="rabat">Rabat</SelectItem>
                        <SelectItem value="marrakech">Marrakech</SelectItem>
                        <SelectItem value="fes">Fès</SelectItem>
                        <SelectItem value="tanger">Tanger</SelectItem>
                        <SelectItem value="agadir">Agadir</SelectItem>
                        <SelectItem value="meknes">Meknès</SelectItem>
                        <SelectItem value="oujda">Oujda</SelectItem>
                        <SelectItem value="kenitra">Kénitra</SelectItem>
                        <SelectItem value="tetouan">Tétouan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job-type">Type de contrat *</Label>
                    <Select>
                      <SelectTrigger id="job-type" className="w-full">
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cdi">CDI</SelectItem>
                        <SelectItem value="cdd">CDD</SelectItem>
                        <SelectItem value="stage">Stage</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                        <SelectItem value="temps-partiel">Temps partiel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie *</Label>
                    <Select>
                      <SelectTrigger id="category" className="w-full">
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tech">Technologie & IT</SelectItem>
                        <SelectItem value="marketing">Marketing & Communication</SelectItem>
                        <SelectItem value="finance">Finance & Comptabilité</SelectItem>
                        <SelectItem value="rh">Ressources Humaines</SelectItem>
                        <SelectItem value="vente">Vente & Commerce</SelectItem>
                        <SelectItem value="education">Éducation & Formation</SelectItem>
                        <SelectItem value="sante">Santé & Médical</SelectItem>
                        <SelectItem value="ingenierie">Ingénierie</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Expérience requise *</Label>
                    <Select>
                      <SelectTrigger id="experience" className="w-full">
                        <SelectValue placeholder="Sélectionnez le niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debutant">Débutant (0-1 an)</SelectItem>
                        <SelectItem value="junior">Junior (1-3 ans)</SelectItem>
                        <SelectItem value="intermediaire">Intermédiaire (3-5 ans)</SelectItem>
                        <SelectItem value="senior">Senior (5+ ans)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="salary-min">Salaire minimum (MAD)</Label>
                    <Input id="salary-min" type="number" placeholder="Ex: 8000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary-max">Salaire maximum (MAD)</Label>
                    <Input id="salary-max" type="number" placeholder="Ex: 12000" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description du poste *</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez les responsabilités, les missions et l'environnement de travail..."
                    className="min-h-32"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Compétences et qualifications requises *</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Listez les compétences techniques, diplômes et qualifications nécessaires..."
                    className="min-h-32"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="benefits">Avantages (optionnel)</Label>
                  <Textarea
                    id="benefits"
                    placeholder="Assurance santé, télétravail, formation continue, tickets restaurant..."
                    className="min-h-24"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email de contact *</Label>
                  <Input id="email" type="email" placeholder="recrutement@entreprise.ma" required />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1">
                    Publier l'offre
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/">Annuler</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
