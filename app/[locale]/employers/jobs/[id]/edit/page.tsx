"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { JobForm } from "@/components/jobs/job-form";

import { useJob } from "@/hooks/useJob";
import { useUpdateJob } from "@/hooks/useUpdateJob";
import { useUpdateJobStatus } from "@/hooks/useUpdateJobStatus";

import { BackButton } from "@/components/ui/back-button";
import { toast } from "@/hooks/use-toast";

export default function EditJobPage() {
    const { id } = useParams();
    const jobId = Number(id);
    const router = useRouter();

    /** ----------------------------------------
     *  HOOK SETUP (must be at the top)
     * ---------------------------------------- */
    const jobQuery = useJob(jobId);

    const updateJobMutation = useUpdateJob(jobId, () => {
        toast({
            title: "Succès",
            description: "Offre mise à jour !",
        });
        router.push("/employers/jobs");
    });

    const updateStatus = useUpdateJobStatus(jobId, () => {
        toast({
            title: "Succès",
            description: "Offre supprimée !",
        });
        router.push("/employers/jobs");
    });

    const { data: job, isLoading, isError } = jobQuery;

    /** ----------------------------------------
     *  LOADING / ERROR STATES
     * ---------------------------------------- */
    if (isLoading) return <p className="p-6">Chargement…</p>;
    if (isError || !job) return <p className="p-6">Job introuvable…</p>;

    /** ----------------------------------------
     *  RENDER FORM
     * ---------------------------------------- */
    return (
        <div className="min-h-screen py-10 bg-muted/20">
            <div className="container max-w-2xl mx-auto px-4">
                <BackButton label="Retour" />

                <Card>
                    <CardContent className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Modifier l’offre</h1>

                        <JobForm
                            isEditing
                            defaultValues={{
                                title: job.title,
                                description: job.description,
                                salary: job.salary ?? "",
                                status: job.status ?? "ACTIVE",
                            }}
                            onSubmit={(values) => updateJobMutation.mutate(values)}
                            submitting={updateJobMutation.isPending}
                            onDelete={() => updateStatus.mutate("DELETED")}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
