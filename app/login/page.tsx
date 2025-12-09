"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

import { selectUser } from "@/store/slices/authSlice";
import { useLogin } from "@/hooks/auth/useLogin";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const user = useSelector(selectUser);

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (user) router.push(user.role === 'EMPLOYER' ?'/employers/dashboard' : '/profile');
    }, [user, router]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const loginMutation = useLogin((role: string) => {
        if (role === "EMPLOYER") router.push("/employers/dashboard");
        else router.push("/dashboard");
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        loginMutation.mutate({ email, password });
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-8">

                <Link href="/" className="mb-8 flex items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                        <Briefcase className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <span className="text-2xl font-bold">Khidma.ma</span>
                </Link>

                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl">Se connecter</CardTitle>
                        <CardDescription>Accédez à votre espace</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">

                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    placeholder="email@exemple.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Mot de passe</Label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <Button className="w-full" type="submit" disabled={loginMutation.isPending}>
                                {loginMutation.isPending ? "Connexion..." : "Se connecter"}
                            </Button>

                        </form>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-muted-foreground">Pas de compte ? </span>
                            <Link href="/register" className="text-primary hover:underline">
                                S'enregistrer
                            </Link>
                        </div>

                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
