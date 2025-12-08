"use client";

import { Card, CardContent } from "@/components/ui/card";
import { JobForm } from "@/components/jobs/job-form";
import { useRouter } from "next/navigation";
import { useCreateJob } from "@/hooks/useCreateJob";

export function CreateJobClient() {
    const router = useRouter();

    const createJob = useCreateJob(() => {
        router.push("/employers/jobs");
    });

    return (
        <div className="min-h-screen py-10 bg-muted/20">
            <div className="container max-w-2xl mx-auto px-4">
                <Card>
                    <CardContent className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Créer une offre</h1>

                        <JobForm
                            onSubmit={(values) => createJob.mutate(values)}
                            submitting={createJob.isPending}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
