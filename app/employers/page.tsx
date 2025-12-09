import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, ArrowRight, Globe, Phone } from "lucide-react";
import {BackButton} from "@/components/ui/back-button";

export default async function EmployersPage() {
    const employers = await prisma.user.findMany({
        where: { role: "EMPLOYER" },
        include: {
            _count: { select: { jobs: true } },
            city: true,
            country: true,
        },
    });

    if (!employers || employers.length === 0) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <BackButton label="Retour aux offres" />
                <h1 className="mb-2 text-2xl font-bold text-foreground">
                    Employeurs
                </h1>
                <p className="mb-6 text-sm text-muted-foreground">
                    Découvrez les entreprises qui publient des offres sur Khidma.ma.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                    {employers.map((employer) => (
                        <Card key={employer.id} className="overflow-hidden">
                            <CardContent className="p-4 space-y-4">

                                {/* HEADER */}
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Building2 className="h-5 w-5" />
                                    </div>

                                    <div className="flex-1">


                                        {/* Location */}
                                        {(employer.city || employer.country) && (
                                            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                                <MapPin className="h-3 w-3" />
                                                <span>
                          {employer.city?.name}
                                                    {employer.country?.name ? `, ${employer.country.name}` : ""}
                        </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* DESCRIPTION */}
                                {employer.bio && (
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {employer.bio}
                                    </p>
                                )}

                                {/* CONTACT + INFO */}
                                {(employer.companyWebsite || employer.phone) && (
                                    <div className="text-xs space-y-1 text-muted-foreground">

                                        {employer.companyWebsite && (
                                            <p className="flex items-center gap-1">
                                                <Globe className="h-3 w-3" />
                                                <a
                                                    href={employer.companyWebsite}
                                                    target="_blank"
                                                    className="text-primary hover:underline"
                                                >
                                                    {employer.companyWebsite}
                                                </a>
                                            </p>
                                        )}

                                        {employer.phone && (
                                            <p className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" /> {employer.phone}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* JOB COUNT */}
                                <p className="text-xs text-muted-foreground">
                                    {employer._count.jobs} offre
                                    {employer._count.jobs > 1 ? "s" : ""} publiée
                                </p>

                                {/* CTA */}
                                <Button
                                    asChild
                                    className="w-full justify-between bg-primary text-primary-foreground hover:bg-primary/90"
                                    size="sm"
                                >
                                    <Link href={`/employers/${employer.id}`}>
                                        <span>Voir les offres</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>

                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
