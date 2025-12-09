import {prisma} from "@/lib/prisma";
import {getUserFromAuth} from "@/lib/auth";
import {redirect} from "next/navigation";
import ApplicationsList from "./ApplicationsList";
import {formatRelativeDate} from "@/lib/date";
import {BackButton} from "@/components/ui/back-button";


export default async function EmployerApplicationsPage() {
    const employer = await getUserFromAuth();

    if (!employer || employer.role !== "EMPLOYER") {
        redirect("/login");
    }

    const applications = await prisma.application.findMany({
        where: {job: {employerId: employer.id}}, include: {
            job: true, user: true,
        }, orderBy: {createdAt: "desc"},
    });

    const mapped = applications.map((a) => ({
        id: a.id, user: {
            id: a.user.id,
            name: a.user.name ?? "Candidat",
            email: a.user.email ?? "",
            avatarUrl: undefined,
            position: a.job.title,
            appliedAt: formatRelativeDate(a.createdAt),
            status: a.status?.toLowerCase() === "pending" ? "new" : "reviewed",
        },
    }));

    return (<div className="min-h-screen bg-muted/20 py-10">
            <div className="container mx-auto max-w-3xl px-4">
                <BackButton label="Retour vers le tableau de bord" />

                <h1 className="text-3xl font-bold mb-6">Candidatures reçues</h1>

                <ApplicationsList applications={mapped}/>
            </div>
        </div>);
}
