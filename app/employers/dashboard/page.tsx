"use client";

import { useEmployerDashboard } from "@/hooks/useEmployerDashboard";
import { DashboardHeader } from "@/components/employers/DashboardHeader";
import { DashboardStats } from "@/components/employers/DashboardStats";
import { DashboardTabs } from "@/components/employers/DashboardTabs";

export default function EmployerDashboard() {
    const { data, isLoading, error } = useEmployerDashboard();

    if (isLoading) return <div className="p-6">Chargement...</div>;
    if (error) return <div className="p-6 text-red-500">Erreur…</div>;

    return (
        <main className="bg-muted/20 py-12 min-h-screen">
            <div className="container mx-auto px-4">
                <DashboardHeader />

                <DashboardStats stats={data.stats} />

                <DashboardTabs
                    offers={data.offers}
                    applicants={data.applicants}
                />
            </div>
        </main>
    );
}
