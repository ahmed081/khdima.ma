import Link from "next/link";
import {prisma} from "@/lib/prisma";
import {notFound} from "next/navigation";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {ArrowLeft, Briefcase, DollarSign, MapPin} from "lucide-react";


export default async function EmployerJobsPage(props: { params: Promise<{ id: string }> }) {
    const {id} = await props.params
    const employerId = Number(id)
    if (isNaN(employerId)) {
        notFound();
    }


    const employer = await prisma.user.findUnique({
        where: {id: employerId}, include: {
            jobs: {
                include: {
                    city: true, country: true, contractType: true, // skills: { include: { skill: true } }, // if needed
                },
            },
        },
    });

    if (!employer) {
        notFound();
    }

    const jobs = employer.jobs;

    return (<div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-3xl">

                {/* Back */}
                <Link
                    href="/employers"
                    className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                >
                    <ArrowLeft className="h-4 w-4"/>
                    Retour aux employeurs
                </Link>

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">
                        Offres de {employer.companyName ?? employer.name ?? "Entreprise"}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {jobs.length} offre{jobs.length > 1 ? "s" : ""} publiée
                    </p>
                </div>

                {/* Job list */}
                {jobs.length === 0 ? (<p className="text-sm text-muted-foreground">
                        Cet employeur n&apos;a pas encore publié d&apos;offres.
                    </p>) : (<div className="space-y-4">
                        {jobs.map((job) => (<Card key={job.id} className="overflow-hidden">
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h2 className="text-lg font-semibold text-foreground">
                                                {job.title}
                                            </h2>
                                            <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="h-3.5 w-3.5 text-primary"/>
                                                    <span>
                            {job.city?.name}
                                                        {job.country?.name ? `, ${job.country.name}` : ""}
                          </span>
                                                </div>
                                                {job.contractType && (<div className="flex items-center gap-1.5">
                                                        <Briefcase className="h-3.5 w-3.5 text-primary"/>
                                                        <Badge variant="secondary" className="text-[11px]">
                                                            {job.contractType.name}
                                                        </Badge>
                                                    </div>)}
                                                {job.salary && (<div className="flex items-center gap-1.5">
                                                        <DollarSign className="h-3.5 w-3.5 text-primary"/>
                                                        <span className="font-medium text-foreground">
                              {job.salary}
                            </span>
                                                    </div>)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Short description */}
                                    {job.description && (<p className="text-sm text-muted-foreground line-clamp-3">
                                            {job.description}
                                        </p>)}

                                    <div className="pt-2 flex justify-end">
                                        <Button
                                            asChild
                                            size="sm"
                                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                                        >
                                            <Link href={`/jobs/${job.id}`}>
                                                Voir les détails
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>))}
                    </div>)}
            </div>
        </div>);
}
