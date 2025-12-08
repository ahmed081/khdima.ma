"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { selectUser, setUser } from "@/store/slices/authSlice";
import { API_REQUEST_FAILED } from "@/store/sagas/requestWatcherSaga";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Mail } from "lucide-react";

export default function ProfilePage() {
    const user = useSelector(selectUser);
    const router = useRouter();
    const dispatch = useDispatch();

    const [name, setName] = useState(user?.name || "");
    const [password, setPassword] = useState("");

    // If no user → redirect to login
    useEffect(() => {
        if (user === null) {
            router.push("/login");
        }
    }, [user, router]);

    // Update profile mutation
    const updateMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/profile/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    password: password || undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                const err: any = new Error(data.error || "Erreur mise à jour");
                err.status = res.status;
                throw err;
            }

            return data;
        },

        onSuccess: (updatedUser) => {
            dispatch(setUser(updatedUser)); // Update redux
        },

        onError: (err: any) => {
            dispatch({
                type: API_REQUEST_FAILED,
                payload: { status: err.status, message: err.message },
            });
        },
    });

    if (!user) return null; // Prevent flicker while redirecting

    return (
        <div className="min-h-screen py-10 bg-muted/20">
            <div className="container max-w-xl mx-auto px-4">

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Mon Profil</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">

                        {/* Email (readonly) */}
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/40 cursor-not-allowed">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{user.email}</span>
                            </div>
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <Label>Nom</Label>
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Votre nom"
                                />
                            </div>
                        </div>

                        {/* Change password */}
                        <div className="space-y-2">
                            <Label>Nouveau mot de passe (optionnel)</Label>
                            <Input
                                type="password"
                                value={password}
                                placeholder="••••••••"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <Button
                            className="w-full"
                            onClick={() => updateMutation.mutate()}
                        >
                            {updateMutation.isPending ? "Enregistrement…" : "Enregistrer"}
                        </Button>

                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
