"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { JobForm } from "@/components/jobs/job-form";

import { useJob } from "@/hooks/useJob";
import { useUpdateJob } from "@/hooks/useUpdateJob";

export default function EditJobPage() {
    const { id } = useParams();
    const jobId = Number(id);
    const router = useRouter();

    // ✅ Hooks MUST come before ANY conditional return
    const jobQuery = useJob(jobId);               // Hook #1
    const updateJobMutation = useUpdateJob(       // Hook #2
        jobId,
        () => router.push("/employers/jobs")
    );

    const { data: job, isLoading, isError } = jobQuery;

    // ❌ This was the source of your bug (hook called AFTER return)
    if (isLoading) return <p className="p-6">Chargement…</p>;
    if (isError || !job) return <p className="p-6">Job introuvable…</p>;

    return (
        <div className="min-h-screen py-10 bg-muted/20">
            <div className="container max-w-2xl mx-auto px-4">
                <Card>
                    <CardContent className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Modifier l’offre</h1>

                        <JobForm
                            defaultValues={{
                                title: job.title,
                                description: job.description,
                                salary: job.salary,
                                status: job.status,
                            }}
                            onSubmit={(values) => updateJobMutation.mutate(values)}
                            submitting={updateJobMutation.isPending}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
