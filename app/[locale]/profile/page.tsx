"use client"

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useRouter } from "@/i18n/navigation"
import { useMutation } from "@tanstack/react-query"
import { selectUser, setUser, selectAuthInitialized } from "@/store/slices/authSlice"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { User, Mail, Phone } from "lucide-react"
import { Link } from "@/i18n/navigation"

export default function ProfilePage() {
  const user = useSelector(selectUser)
  const initialized = useSelector(selectAuthInitialized)
  const router = useRouter()
  const dispatch = useDispatch()

  const [name, setName] = useState(user?.name ?? "")
  const [password, setPassword] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (initialized && user === null) {
      router.push("/login")
    }
    if (user) setName(user.name ?? "")
  }, [initialized, user, router])

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password: password || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Update failed")
      return data
    },
    onSuccess: (updatedUser) => {
      dispatch(setUser(updatedUser))
      setSuccess(true)
      setPassword("")
    },
  })

  if (!initialized || !user) return null

  return (
    <div className="min-h-screen py-10 bg-muted/20">
      <div className="container max-w-xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Mon Profil</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/40">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{user.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nom</Label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom" />
              </div>
            </div>

            {user.phone && (
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/40">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{user.phone}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Nouveau mot de passe (optionnel)</Label>
              <Input type="password" value={password} placeholder="••••••••" onChange={e => setPassword(e.target.value)} />
            </div>

            {success && <p className="text-sm text-green-600">Profil mis à jour avec succès !</p>}
            {updateMutation.isError && <p className="text-sm text-red-600">{(updateMutation.error as any)?.message}</p>}

            <Button className="w-full" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>

            {user.role === 'PROVIDER' && (
              <div className="pt-2 border-t">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/provider/dashboard">Mon tableau de bord professionnel</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
