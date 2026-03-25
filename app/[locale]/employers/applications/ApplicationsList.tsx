"use client";

import UserCard from "@/components/users/user-card";
import {useRouter} from "@/i18n/navigation";

export default function ApplicationsList({
                                             applications,
                                         }: {
    applications: {
        id: number; user: any;
    }[];
}) {
    const router = useRouter();

    return (<div className="space-y-4">
            {applications.length === 0 && (<p className="text-muted-foreground">
                    Aucune candidature reçue pour le moment.
                </p>)}

            {applications.map((app) => (<UserCard
                    key={app.id}
                    user={app.user}
                    variant="withAvatar"
                    onViewProfile={(id) => router.push(`/employers/candidate/${id}`)}
                    onContact={(user) => console.log("Contacting", user)}
                />))}
        </div>);
}
