import {prisma} from "@/lib/prisma";
import {notFound} from "next/navigation";
import {JobCard} from "@/components/jobs/job-card";
import {BackButton} from "@/components/ui/back-button";

export default async function EmployerJobsPage(props: { params: Promise<{ id: string }> }) {
    const {id} = await props.params;
    const employerId = Number(id);

    if (isNaN(employerId)) {
        notFound();
    }

    const employer = await prisma.user.findUnique({
        where: {id: employerId}, include: {
            jobs: {
                include: {
                    city: true,
                    country: true,
                    contractType: true,
                    skills: {include: {skill: true}},
                    _count: {select: {applications: true}},
                },
            },
        },
    });

    if (!employer) notFound();

    const jobs = employer.jobs;

    return (<div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-3xl">

                {/* Back */}
                <BackButton label="Retour aux employeurs"/>


                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">
                        Offres de {employer.companyName ?? employer.name ?? "Entreprise"}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {jobs.length} offre{jobs.length > 1 ? "s" : ""} publiée
                    </p>
                </div>

                {/* Job List */}
                {jobs.length === 0 ? (<p className="text-sm text-muted-foreground">
                        Cet employeur n&apos;a pas encore publié d&apos;offres.
                    </p>) : (<div className="space-y-4">
                        {jobs.map((job) => (<JobCard key={job.id} job={job} variant="public"/>))}
                    </div>)}

            </div>
        </div>);
}
