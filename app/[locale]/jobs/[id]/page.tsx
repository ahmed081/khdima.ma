import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getUserFromAuth } from "@/lib/auth";
import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
    MapPin,
    Clock,
    Briefcase,
    DollarSign,
    Building2,
    Edit,
    Send
} from "lucide-react";

import { BackButton } from "@/components/ui/back-button";
import { DeleteJobButton } from "@/components/jobs/DeleteJobButton";

export default async function JobDetailPage(props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;
    const jobId = Number(id);
    if (isNaN(jobId)) notFound();

    const user = await getUserFromAuth();

    const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: {
            employer: true,
            city: true,
            country: true,
            contractType: true,
            skills: { include: { skill: true } },
        },
    });

    if (!job) notFound();

    const isOwner = user?.role === "EMPLOYER" && user.id === job.employerId;

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-2xl">

                {/* ⬅ Back Button */}
                <BackButton label="Retour aux offres" />

                <Card className="overflow-hidden">

                    {/* 🔹 Employer Header */}
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">

                            <div className="flex gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Building2 className="h-5 w-5" />
                                </div>

                                <div>
                                    <p className="font-semibold text-foreground">
                                        {job.employer?.companyName ?? "Entreprise"}
                                    </p>

                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>
                                            Publié le{" "}
                                            {new Date(job.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 🔥 Owner Action Buttons */}
                            {isOwner && (
                                <div className="relative flex gap-2">

                                    <Link href={`/employers/jobs/${job.id}/edit`}>
                                        <Button variant="outline" size="sm">
                                            <Edit className="w-4 h-4 mr-2" /> Modifier
                                        </Button>
                                    </Link>

                                    {/* Delete with modal */}
                                    <DeleteJobButton jobId={job.id} />
                                </div>
                            )}
                        </div>
                    </CardContent>

                    {/* 🔹 Job Information */}
                    <CardContent className="px-4 pb-4 pt-0">
                        <h1 className="mb-2 text-xl font-bold text-foreground">
                            {job.title}
                        </h1>

                        {/* Tags */}
                        <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">

                            {/* Location */}
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span>
                                    {job.city?.name}
                                    {job.country?.name ? `, ${job.country.name}` : ""}
                                </span>
                            </div>

                            {/* Contract type */}
                            <div className="flex items-center gap-1.5">
                                <Briefcase className="h-4 w-4 text-primary" />
                                <Badge variant="secondary" className="text-xs">
                                    {job.contractType?.name ?? "Contrat"}
                                </Badge>
                            </div>

                            {/* Salary */}
                            {job.salary && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <DollarSign className="h-4 w-4 text-primary" />
                                    <span className="font-medium text-foreground">{job.salary}</span>
                                </div>
                            )}
                        </div>

                        {/* Skills */}
                        <div className="mb-4 flex flex-wrap gap-2">
                            {job.skills.map((js) => (
                                <Badge key={js.skill.id} variant="outline" className="text-xs">
                                    {js.skill.name}
                                </Badge>
                            ))}
                        </div>

                        {/* Description & Details */}
                        <div className="space-y-6 text-sm leading-relaxed">

                            {/* Description */}
                            <div>
                                <h3 className="mb-2 font-semibold">Description du poste :</h3>
                                <p className="text-pretty whitespace-pre-line">{job.description}</p>
                            </div>

                            {/* Competencies */}
                            {job.competencies.length > 0 && (
                                <SectionList
                                    title="Compétences principales :"
                                    items={job.competencies}
                                />
                            )}

                            {/* Requirements */}
                            {job.requirements.length > 0 && (
                                <SectionList
                                    title="Profil recherché :"
                                    items={job.requirements}
                                />
                            )}

                            {/* Benefits */}
                            {job.benefits.length > 0 && (
                                <SectionList
                                    title="Avantages :"
                                    items={job.benefits}
                                />
                            )}
                        </div>
                    </CardContent>

                    {/* 🔹 Apply CTA */}
                    {!isOwner && (
                        <CardContent className="border-t bg-accent/30 p-4">
                            <Link href={`/jobs/${jobId}/apply`}>
                                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                                    <Send className="mr-2 h-4 w-4" />
                                    Postuler maintenant
                                </Button>
                            </Link>
                        </CardContent>
                    )}
                </Card>
            </div>
        </div>
    );
}

/* 🔧 Small helper component for lists */
function SectionList({ title, items }: { title: string; items: string[] }) {
    return (
        <div>
            <h3 className="mb-2 font-semibold">{title}</h3>
            <ul className="space-y-1.5">
                {items.map((item, i) => (
                    <li key={i} className="flex gap-2 text-muted-foreground">
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-primary" />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}
