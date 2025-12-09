import { prisma } from "@/lib/prisma";
import { getUserFromAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { JobCard } from "@/components/jobs/job-card";
import {BackButton} from "@/components/ui/back-button";

export default async function EmployerJobsPage() {
    const employer = await getUserFromAuth();

    if (!employer || employer.role !== "EMPLOYER") {
        redirect("/login");
    }

    const jobs = await prisma.job.findMany({
        where: {  employerId: employer.id,
            status: { in: ["PENDING_REVIEW", "ACTIVE"] }, },
        include: {

            _count: { select: { applications: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="min-h-screen bg-muted/20 py-10">
            <div className="container mx-auto max-w-3xl px-4">
                <BackButton label="Retour vers le tableau de bord" />

                <h1 className="text-3xl font-bold mb-6">Mes offres d’emploi</h1>

                {jobs.length === 0 ? (
                    <p className="text-muted-foreground">
                        Vous n’avez encore publié aucune offre.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {jobs.map((job) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                variant="employer"  // 👈 employer mode
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
