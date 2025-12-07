"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"

import { Briefcase, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

import { useCountries } from "@/hooks/useCountries"
import { useCities } from "@/hooks/useCities"
import { useContractTypes } from "@/hooks/useContractTypes"
import { useSkills } from "@/hooks/useSkills"
import { useJobCategories } from "@/hooks/useJobCategories"
import { useExperienceLevels } from "@/hooks/useExperienceLevels"

export default function PostJobPage() {
  const router = useRouter()
  const [selectedSkills, setSelectedSkills] = useState<number[]>([])
  const [cityParent, setCityParent] = useState<number | undefined>()
  const [error, setError] = useState("")

  // ------------------------------------------
  // React Hook Form
  // ------------------------------------------
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      title: "",
      companyName: "",
      countryId: "",
      cityId: "",
      contractTypeId: "",
      categoryId: "",
      experienceLevelId: "",
      salaryMin: "",
      salaryMax: "",
      description: "",
      requirements: "",
      benefits: "",
      competencies: "",
      skills: [],
    }

  })

  // Watch country to load cities
  const selectedCountry = watch("countryId")

  // ------------------------------------------
  // Data fetching (React Query hooks)
  // ------------------------------------------
  const { data: countries } = useCountries()
  const { data: cities } = useCities(selectedCountry ? Number(selectedCountry) : undefined)
  const { data: contractTypes } = useContractTypes()
  const { data: skillContexts } = useSkills()
  const { data: jobCategories } = useJobCategories()
  const { data: experienceLevels } = useExperienceLevels()

  // ------------------------------------------
  // Toggle selected skills
  // ------------------------------------------
  const toggleSkill = (id: number) => {
    setSelectedSkills(prev =>
        prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id],
    )
  }

  // ------------------------------------------
  // Job creation mutation
  // ------------------------------------------
  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erreur lors de la création.")

      return data
    },
    onSuccess: job => {
      router.push(`/jobs/${job.id}`)
    },
    onError: (err: any) => setError(err.message),
  })

  // ------------------------------------------
  // Submit handler
  // ------------------------------------------
  const onSubmit = (formValues: any) => {
    setError("")
    mutation.mutate({
      ...formValues,
      skills: selectedSkills,
    })
  }

  return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
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
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  {/* Title + Company */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Titre du poste *</Label>
                      <Input placeholder="Développeur Full Stack" {...register("title", { required: true })} />
                    </div>

                    <div className="space-y-2">
                      <Label>Entreprise *</Label>
                      <Input placeholder="Nom de votre entreprise" {...register("companyName", { required: true })} />
                    </div>
                  </div>

                  {/* Country + City */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Pays *</Label>
                      <Select
                          onValueChange={val => {
                            setValue("countryId", val)
                            setValue("cityId", "")
                            setCityParent(Number(val))
                          }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un pays" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries?.map(c => (
                              <SelectItem key={c.id} value={c.id.toString()}>
                                {c.name}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Ville *</Label>
                      <Select onValueChange={val => setValue("cityId", val)} disabled={!selectedCountry}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une ville" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities?.map(city => (
                              <SelectItem key={city.id} value={city.id.toString()}>
                                {city.name}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Category + Experience */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Catégorie *</Label>
                      <Select onValueChange={val => setValue("categoryId", val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisissez une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobCategories?.map(cat => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Expérience *</Label>
                      <Select onValueChange={val => setValue("experienceLevelId", val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Niveau d'expérience" />
                        </SelectTrigger>
                        <SelectContent>
                          {experienceLevels?.map(level => (
                              <SelectItem key={level.id} value={level.id.toString()}>
                                {level.name}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Contract + Salary */}
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Type de contrat *</Label>
                      <Select onValueChange={val => setValue("contractTypeId", val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez" />
                        </SelectTrigger>
                        <SelectContent>
                          {contractTypes?.map(ct => (
                              <SelectItem key={ct.id} value={ct.id.toString()}>
                                {ct.name}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Salaire min</Label>
                      <Input type="number" placeholder="8000" {...register("salaryMin")} />
                    </div>

                    <div>
                      <Label>Salaire max</Label>
                      <Input type="number" placeholder="12000" {...register("salaryMax")} />
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <Label>Compétences recherchées</Label>
                    {skillContexts?.map(ctx => (
                        <div key={ctx.id} className="mb-3">
                          <p className="font-semibold text-sm mb-2">{ctx.name}</p>

                          <div className="flex flex-wrap gap-2">
                            {ctx.skills.map((skill: any) => {
                              const active = selectedSkills.includes(skill.id)
                              return (
                                  <Badge
                                      key={skill.id}
                                      variant={active ? "default" : "outline"}
                                      className="cursor-pointer"
                                      onClick={() => toggleSkill(skill.id)}
                                  >
                                    {skill.name}
                                  </Badge>
                              )
                            })}
                          </div>
                        </div>
                    ))}
                  </div>

                  {/* Description */}
                  <div>
                    <Label>Description *</Label>
                    <Textarea
                        className="min-h-32"
                        placeholder="Décrivez les missions et responsabilités"
                        {...register("description", { required: true })}
                    />
                  </div>

                  {/* Requirements */}
                  <div>
                    <Label>Compétences requises *</Label>
                    <Textarea className="min-h-24" {...register("requirements", { required: true })} />
                  </div>

                  {/* Benefits */}
                  <div>
                    <Label>Avantages</Label>
                    <Textarea className="min-h-20" {...register("benefits")} />
                  </div>

             

                  {/* Error */}
                  {error && <p className="text-sm text-red-600">{error}</p>}

                  {/* Submit */}
                  <div className="flex gap-4 pt-4">
                    <Button type="submit" className="flex-1" disabled={mutation.isLoading}>
                      {mutation.isLoading ? "Publication..." : "Publier l'offre"}
                    </Button>
                    <Button variant="outline" asChild>
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
