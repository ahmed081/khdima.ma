"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { useCountries } from "@/hooks/useCountries"
import { useCities } from "@/hooks/useCities"
import { useContractTypes } from "@/hooks/useContractTypes"
import { useSkills } from "@/hooks/useSkills"

interface UserFormValues {
    name: string
    email: string
    phone: string
    role: string
    countryId: string
    cityId: string
    contractTypeId: string
    skills: number[]
    password?: string
    confirm?: string
}

export default function UserForm({
                                     initialValues,
                                     onSubmit,
                                     mode = "register",
                                 }: {
    initialValues: UserFormValues
    onSubmit: (values: UserFormValues) => void
    mode?: "register" | "profile"
}) {
    const [form, setForm] = useState<UserFormValues>(initialValues)
    const [error, setError] = useState("")

    const update = (k: keyof UserFormValues, v: any) =>
        setForm((prev) => ({ ...prev, [k]: v }))

    // Load remote datasets
    const { data: countries } = useCountries()
    const { data: cities } = useCities(Number(form.countryId))
    const { data: contractTypes } = useContractTypes()
    const { data: skillContexts } = useSkills()

    useEffect(() => setForm(initialValues), [initialValues])

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")

        if (mode === "register" && form.password !== form.confirm) {
            setError("Les mots de passe ne correspondent pas.")
            return
        }

        onSubmit(form)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div className="space-y-2">
                <Label>Email</Label>

                {mode === "register" ? (
                    <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        required
                    />
                ) : (
                    <div className="p-3 border rounded bg-muted/40">{form.email}</div>
                )}
            </div>

            {/* Name */}
            <div>
                <Label>Nom</Label>
                <Input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    required
                />
            </div>

            {/* Phone */}
            <div>
                <Label>Téléphone</Label>
                <Input
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    required
                />
            </div>

            {/* Role (only on register) */}
            {mode === "register" && (
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
            )}

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
                    disabled={!form.countryId}
                    value={form.cityId}
                    onValueChange={(v) => update("cityId", v)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une ville" />
                    </SelectTrigger>
                    <SelectContent>
                        {cities?.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                                {c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Contract Type */}
            <div>
                <Label>Type de contrat préféré</Label>
                <Select
                    value={form.contractTypeId}
                    onValueChange={(v) => update("contractTypeId", v)}
                >
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
                <Label>Compétences</Label>
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

            {/* Password section */}
            <div>
                <Label>
                    {mode === "register"
                        ? "Mot de passe"
                        : "Nouveau mot de passe (optionnel)"}
                </Label>
                <Input
                    type="password"
                    value={form.password || ""}
                    onChange={(e) => update("password", e.target.value)}
                />
            </div>

            {mode === "register" && (
                <div>
                    <Label>Confirmer mot de passe</Label>
                    <Input
                        type="password"
                        value={form.confirm || ""}
                        onChange={(e) => update("confirm", e.target.value)}
                        required
                    />
                </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button className="w-full" type="submit">
                {mode === "register" ? "S'enregistrer" : "Enregistrer"}
            </Button>
        </form>
    )
}
