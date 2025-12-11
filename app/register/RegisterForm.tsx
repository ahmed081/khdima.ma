"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerAction } from "@/app/actions/register"

// UI components
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardDescription, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// Typed axios hooks
import { useCountries } from "@/hooks/useCountries"
import { useCities } from "@/hooks/useCities"
import { useContractTypes } from "@/hooks/useContractTypes"
import { useSkills } from "@/hooks/useSkills"

export default function RegisterForm() {
    const router = useRouter()
    const [error, setError] = useState("")

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

    // Update handler
    const update = (k: string, v: any) =>
        setForm((prev) => ({ ...prev, [k]: v }))

    // Load remote data
    const { data: countries } = useCountries()
    const { data: cities } = useCities(Number(form.countryId))
    const { data: contractTypes } = useContractTypes()
    const { data: skillContexts } = useSkills()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")

        if (form.password !== form.confirm) {
            setError("Les mots de passe ne correspondent pas.")
            return
        }

        const res = await registerAction(form)

        if (!res.success) {
            setError(res.error || "Erreur inconnue.")
            return
        }

        router.push("/login")
    }

    return (
        <Card className="max-w-md mx-auto shadow-lg">
            <CardHeader>
                <CardTitle>S'enregistrer</CardTitle>
                <CardDescription>Créez votre compte</CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <Label>Nom complet</Label>
                        <Input value={form.name} onChange={(e) => update("name", e.target.value)} required />
                    </div>

                    {/* Email */}
                    <div>
                        <Label>Email</Label>
                        <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
                    </div>

                    {/* Phone */}
                    <div>
                        <Label>Téléphone</Label>
                        <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} required />
                    </div>

                    {/* Role */}
                    <div>
                        <Label>Type de compte</Label>
                        <Select value={form.role} onValueChange={(v) => update("role", v)}>
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
                    <div>
                        <Label>Pays</Label>
                        <Select
                            value={form.countryId}
                            onValueChange={(v) => {
                                update("countryId", v)
                                update("cityId", "")
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un pays" />
                            </SelectTrigger>
                            <SelectContent>
                                {countries?.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* City */}
                    <div>
                        <Label>Ville</Label>
                        <Select
                            value={form.cityId}
                            onValueChange={(v) => update("cityId", v)}
                            disabled={!form.countryId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez une ville" />
                            </SelectTrigger>
                            <SelectContent>
                                {cities?.map((city) => (
                                    <SelectItem key={city.id} value={String(city.id)}>
                                        {city.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Contract Type */}
                    <div>
                        <Label>Type de contrat préféré</Label>
                        <Select value={form.contractTypeId} onValueChange={(v) => update("contractTypeId", v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un type" />
                            </SelectTrigger>
                            <SelectContent>
                                {contractTypes?.map((ct) => (
                                    <SelectItem key={ct.id} value={String(ct.id)}>
                                        {ct.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Skills */}
                    <div>
                        <Label>Compétences (optionnel)</Label>

                        {skillContexts?.map((ctx) => (
                            <div key={ctx.id} className="mb-3">
                                <p className="font-semibold">{ctx.name}</p>
                                <div className="flex flex-wrap gap-2">
                                    {ctx.skills.map((skill) => {
                                        const active = form.skills.includes(skill.id)
                                        return (
                                            <Badge
                                                key={skill.id}
                                                variant={active ? "default" : "outline"}
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    update(
                                                        "skills",
                                                        active
                                                            ? form.skills.filter((id) => id !== skill.id)
                                                            : [...form.skills, skill.id]
                                                    )
                                                }
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
                    <div>
                        <Label>Mot de passe</Label>
                        <Input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required />
                    </div>

                    {/* Confirm */}
                    <div>
                        <Label>Confirmer le mot de passe</Label>
                        <Input type="password" value={form.confirm} onChange={(e) => update("confirm", e.target.value)} required />
                    </div>

                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    <Button className="w-full">S'enregistrer</Button>
                </form>
            </CardContent>
        </Card>
    )
}
