"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"

import { Briefcase } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCountries } from "@/hooks/useCountries"
import { useCities } from "@/hooks/useCities"
import { useContractTypes } from "@/hooks/useContractTypes"
import { useSkills } from "@/hooks/useSkills"
import { Badge } from "@/components/ui/badge"

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "job-seeker",
    countryId: "",
    cityId: "",
    contractTypeId: "",
    password: "",
    confirm: "",
    skills: [] as number[],
  })

  const [localError, setLocalError] = useState("")

  const updateField = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // Load dynamic constants
  const { data: countries } = useCountries()
  const { data: cities } = useCities(Number(form.countryId))
  const { data: contractTypes } = useContractTypes()
  const { data: skillContexts } = useSkills()

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'inscription.")
      return data
    },
    onSuccess: () => router.push("/dashboard"),
    onError: (err: any) => setLocalError(err.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")

    if (form.password !== form.confirm) {
      setLocalError("Les mots de passe ne correspondent pas.")
      return
    }

    registerMutation.mutate()
  }

  return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-8">

          {/* Logo */}
          <Link href="/" className="mb-8 flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Briefcase className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Khidma.ma</span>
          </Link>

          <Card className="w-full max-w-md shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">S'enregistrer</CardTitle>
              <CardDescription>Créez votre compte pour commencer</CardDescription>
            </CardHeader>

            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>

                {/* Name */}
                <div className="space-y-2">
                  <Label>Nom complet</Label>
                  <Input
                      value={form.name}
                      onChange={e => updateField("name", e.target.value)}
                      required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                      type="email"
                      value={form.email}
                      onChange={e => updateField("email", e.target.value)}
                      required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input
                      value={form.phone}
                      onChange={e => updateField("phone", e.target.value)}
                      required
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label>Type de compte</Label>
                  <Select value={form.role} onValueChange={val => updateField("role", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="job-seeker">Chercheur d'emploi</SelectItem>
                      <SelectItem value="employer">Employeur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <Label>Pays</Label>
                  <Select
                      value={form.countryId}
                      onValueChange={val => {
                        updateField("countryId", val)
                        updateField("cityId", "")
                      }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un pays" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries?.map((c: any) => (
                          <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Select
                      value={form.cityId}
                      onValueChange={val => updateField("cityId", val)}
                      disabled={!form.countryId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une ville" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities?.map((city: any) => (
                          <SelectItem key={city.id} value={city.id.toString()}>{city.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Contract type */}
                <div className="space-y-2">
                  <Label>Type de contrat préféré</Label>
                  <Select
                      value={form.contractTypeId}
                      onValueChange={val => updateField("contractTypeId", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {contractTypes?.map((ct: any) => (
                          <SelectItem key={ct.id} value={ct.id.toString()}>{ct.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <Label>Compétences (optionnel)</Label>
                  {skillContexts?.map((ctx: any) => (
                      <div key={ctx.id}>
                        <p className="font-semibold mb-2">{ctx.name}</p>
                        <div className="flex flex-wrap gap-2">
                          {ctx.skills.map((skill: any) => {
                            const active = form.skills.includes(skill.id)
                            return (
                                <Badge
                                    key={skill.id}
                                    variant={active ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => {
                                      if (active) {
                                        updateField("skills", form.skills.filter(id => id !== skill.id))
                                      } else {
                                        updateField("skills", [...form.skills, skill.id])
                                      }
                                    }}
                                >
                                  {skill.name}
                                </Badge>
                            )
                          })}
                        </div>
                      </div>
                  ))}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label>Mot de passe</Label>
                  <Input
                      type="password"
                      value={form.password}
                      onChange={e => updateField("password", e.target.value)}
                      required
                  />
                </div>

                {/* Confirm */}
                <div className="space-y-2">
                  <Label>Confirmer le mot de passe</Label>
                  <Input
                      type="password"
                      value={form.confirm}
                      onChange={e => updateField("confirm", e.target.value)}
                      required
                  />
                </div>

                {/* Error */}
                {localError && <p className="text-sm text-red-600">{localError}</p>}

                <Button className="w-full" disabled={registerMutation.isLoading}>
                  {registerMutation.isLoading ? "Création du compte..." : "S'enregistrer"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Vous avez déjà un compte ? </span>
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Se connecter
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}
