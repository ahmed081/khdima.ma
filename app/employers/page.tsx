import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, ArrowRight } from "lucide-react";

export default async function EmployersPage() {
    const employers = await prisma.user.findMany({
        where: { role: "EMPLOYER" }, // make sure Role enum has EMPLOYER
        include: {
            _count: { select: { jobs: true } }, // assuming relation `jobs` on User
            // city: true, // if you have this
            // country: true,
        },
    });

    if (!employers || employers.length === 0) {
        // optional: render empty state instead of notFound()
        notFound();
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="mb-2 text-2xl font-bold text-foreground">
                    Employeurs
                </h1>
                <p className="mb-6 text-sm text-muted-foreground">
                    Découvrez les entreprises qui publient des offres sur Khidma.ma.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                    {employers.map((employer) => (
                        <Card key={employer.id} className="overflow-hidden">
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="font-semibold text-foreground">
                                            {employer.companyName ?? employer.name ?? "Entreprise"}
                                        </h2>

                                        {/* Optional location if you have city/country on user */}
                                        {/*
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {employer.city?.name}
                        {employer.country?.name ? `, ${employer.country.name}` : ""}
                      </span>
                    </div>
                    */}

                                        <p className="mt-2 text-xs text-muted-foreground">
                                            {employer._count.jobs} offre{employer._count.jobs > 1 ? "s" : ""} publiée
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-2">
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
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
