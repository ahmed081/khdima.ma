"use client";

import { JobCard } from "@/components/jobs/job-card";

import { EmployerJob } from "@/types/dashboard";

export function OfferList({ offers }: { offers: EmployerJob[] }) {
    if (!offers.length) {
        return (
            <p className="text-muted-foreground text-sm">
                Vous n’avez pas encore publié d’offres.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {offers.map((job) => (
                <JobCard key={job.id} job={job} variant="employer" />
            ))}
        </div>
    );
}
