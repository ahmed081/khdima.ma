import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getUserFromAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default async function CandidateProfilePage(props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;

    const employer = await getUserFromAuth();
    if (!employer || employer.role !== "EMPLOYER") {
        redirect("/login");
    }

    const candidateId = Number(id);

    const candidate = await prisma.user.findUnique({
        where: { id: candidateId },
        select: {
            id: true,
            name: true,
            email: true,

            applications: {
                where: {
                    job: {
                        employerId: employer.id, // 👈 ONLY this employer’s jobs
                    },
                },
                include: {
                    job: true,
                },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!candidate) redirect("/employers/applications");

    // Latest CV for *this employer’s* application
    const latestCv =
        candidate.applications.find((a) => a.cvUrl)?.cvUrl ?? null;

    return (
        <div className="min-h-screen bg-muted/20 py-10">
            <div className="container mx-auto max-w-3xl px-4">

                <Link
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-sm mb-6"
                    href="/employers/applications"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour aux candidatures
                </Link>

                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h1 className="text-2xl font-bold">{candidate.name}</h1>
                        <p className="text-muted-foreground">Email : {candidate.email}</p>

                        {latestCv && (
                            <p>
                                <a href={latestCv} target="_blank" className="text-primary underline">
                                    Voir le CV
                                </a>
                            </p>
                        )}

                        <h2 className="text-xl font-semibold pt-4">
                            Candidatures envoyées à votre entreprise
                        </h2>

                        {candidate.applications.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                Ce candidat n’a pas encore postulé à vos offres.
                            </p>
                        )}

                        <div className="space-y-3 pt-2">
                            {candidate.applications.map((a) => (
                                <Card key={a.id}>
                                    <CardContent className="p-4 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{a.job.title}</p>

                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                Statut : <Badge>{a.status}</Badge>
                                            </p>

                                            {a.cvUrl && (
                                                <a
                                                    href={a.cvUrl}
                                                    target="_blank"
                                                    className="text-xs text-primary underline"
                                                >
                                                    Voir CV
                                                </a>
                                            )}
                                        </div>

                                        <Link href={`/jobs/${a.job.id}`} className="text-sm text-primary underline">
                                            Voir l’offre
                                        </Link>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
