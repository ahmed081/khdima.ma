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
import { useTranslations, useLocale } from 'next-intl';

export default function LoginPage() {
    const router = useRouter();
    const user = useSelector(selectUser);
    const t = useTranslations('login');
    const locale = useLocale();

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (user) router.push(user.role === 'EMPLOYER' ? `/${locale}/employers/dashboard` : `/${locale}/profile`);
    }, [user, router, locale]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const loginMutation = useLogin((role: string) => {
        if (role === "EMPLOYER") router.push(`/${locale}/employers/dashboard`);
        else router.push(`/${locale}/dashboard`);
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
                    <span className="text-2xl font-bold">khdimti.com</span>
                </Link>

                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl">{t('title')}</CardTitle>
                        <CardDescription>{t('description')}</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">

                            <div className="space-y-2">
                                <Label>{t('email')}</Label>
                                <Input
                                    type="email"
                                    placeholder={t('emailPlaceholder')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>{t('password')}</Label>
                                <Input
                                    type="password"
                                    placeholder={t('passwordPlaceholder')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <Button className="w-full" type="submit" disabled={loginMutation.isPending}>
                                {loginMutation.isPending ? t('loading') : t('submit')}
                            </Button>

                        </form>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-muted-foreground">{t('noAccount')} </span>
                            <Link href="/register" className="text-primary hover:underline">
                                {t('register')}
                            </Link>
                        </div>

                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
