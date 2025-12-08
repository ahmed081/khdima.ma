import { prisma } from "@/lib/prisma";
import { getUserFromAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function EmployerApplicationsPage() {
    const employer = await getUserFromAuth();
    if (!employer || employer.role !== "EMPLOYER") {
        redirect("/login");
    }

    const applications = await prisma.application.findMany({
        where: { job: { employerId: employer.id } },
        include: {
            job: true,
            user: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="min-h-screen bg-muted/20 py-10">
            <div className="container mx-auto max-w-3xl px-4">
                <h1 className="text-3xl font-bold mb-6">Candidatures reçues</h1>

                {applications.length === 0 && (
                    <p className="text-muted-foreground">
                        Aucune candidature reçue pour le moment.
                    </p>
                )}

                <div className="space-y-4">
                    {applications.map((a) => (
                        <Card key={a.id}>
                            <CardContent className="p-6 flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold">{a.user.name}</h2>
                                    <Badge>{a.status}</Badge>
                                </div>

                                <p className="text-sm text-muted-foreground">
                                    Poste : <strong>{a.job.title}</strong>
                                </p>

                                <div className="flex gap-3 pt-2">
                                    <Button asChild variant="outline">
                                        <Link href={`/employers/candidate/${a.user.id}`}>
                                            Voir profil
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
