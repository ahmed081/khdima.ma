"use client";

import UserCard from "@/components/users/user-card";
import { useRouter } from "next/navigation";
import { Applicant } from "@/types/dashboard";

export function ApplicantList({ applicants }: { applicants: Applicant[] }) {
    const router = useRouter();

    if (!applicants.length) {
        return (
            <p className="text-muted-foreground text-sm">
                Vous n’avez pas encore de candidatures.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {applicants.map((applicant) => (
                <UserCard
                    key={`user-${applicant.id}`}
                    user={applicant}
                    variant="full"
                    onViewProfile={(id) => router.push(`/employers/candidate/${id}`)}
                />
            ))}
        </div>
    );
}
