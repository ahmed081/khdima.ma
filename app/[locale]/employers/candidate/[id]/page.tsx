import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getUserFromAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, MapPin, Briefcase, School } from "lucide-react";

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
            phone: true,
            city: true,
            country: true,
            bio: true,
            // user skills
            skills: {
                include: { skill: true },
            },

            // all applications to this employer
            applications: {
                where: {
                    job: { employerId: employer.id },
                },
                include: {
                    job: true,
                },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!candidate) redirect("/employers/applications");

    const latestCv =
        candidate.applications.find((a) => a.cvUrl)?.cvUrl ?? null;

    return (
        <div className="min-h-screen bg-muted/20 py-10">
            <div className="container mx-auto max-w-3xl px-4">

                <BackButton label="Retour aux candidatures" />

                <Card>
                    <CardContent className="p-6 space-y-8">

                        {/* HEADER */}
                        <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={ ""} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                    {candidate.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                                <h1 className="text-2xl font-bold">{candidate.name}</h1>
                                <p className="text-muted-foreground text-sm">
                                    Candidat — {candidate.city?.name }
                                </p>

                                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                                    {candidate.email && (
                                        <p className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            {candidate.email}
                                        </p>
                                    )}

                                    {candidate.phone && (
                                        <p className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            {candidate.phone}
                                        </p>
                                    )}

                                    {(candidate.city || candidate.country) && (
                                        <p className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            {candidate.city?.name ?? ""} {candidate.country?.name ?? ""}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {latestCv && (
                                <a
                                    href={latestCv}
                                    target="_blank"
                                    className="text-primary underline text-sm"
                                >
                                    Voir le CV
                                </a>
                            )}
                        </div>

                        {/* BIO / ABOUT */}
                        {candidate.bio && (
                            <section>
                                <h2 className="text-xl font-semibold mb-2">À propos</h2>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {candidate.bio}
                                </p>
                            </section>
                        )}

                        {/* SKILLS */}
                        {candidate.skills.length > 0 && (
                            <section>
                                <h2 className="text-xl font-semibold mb-2">Compétences</h2>
                                <div className="flex flex-wrap gap-2">
                                    {candidate.skills.map((s) => (
                                        <Badge key={s.skill.id} variant="outline" className="text-xs">
                                            {s.skill.name}
                                        </Badge>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* EDUCATION PLACEHOLDER */}
                        <section>
                            <h2 className="text-xl font-semibold mb-2">Éducation</h2>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <School className="h-4 w-4" />
                                <span>Non renseignée</span>
                            </div>
                        </section>

                        {/* EXPERIENCE PLACEHOLDER */}
                        <section>
                            <h2 className="text-xl font-semibold mb-2">Expérience</h2>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Briefcase className="h-4 w-4" />
                                <span>Aucune expérience renseignée</span>
                            </div>
                        </section>

                        {/* APPLICATION HISTORY */}
                        <section>
                            <h2 className="text-xl font-semibold pt-4">Candidatures à votre entreprise</h2>

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
                        </section>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
