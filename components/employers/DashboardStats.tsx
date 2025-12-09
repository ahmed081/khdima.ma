"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Briefcase, Users, TrendingUp } from "lucide-react";

import { EmployerDashboardStats } from "@/types/dashboard";

export function DashboardStats({ stats }: { stats: EmployerDashboardStats }) {    const router = useRouter();

    return (
        <div className="grid gap-6 md:grid-cols-3 mb-8">

            {/* ACTIVE */}
            <Card
                className="p-6 shadow-sm cursor-pointer hover:bg-muted/40"
                onClick={() => router.push("/employers/jobs")}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">Offres actives</p>
                        <p className="text-3xl font-bold mt-2">{stats.activeOffers}</p>
                    </div>
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                </div>
            </Card>

            {/* DELETED */}
            <Card className="p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">Offres supprimées</p>
                        <p className="text-3xl font-bold mt-2">{stats.deletedOffers}</p>
                    </div>
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                </div>
            </Card>

            {/* PENDING */}
            <Card className="p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">En attente</p>
                        <p className="text-3xl font-bold mt-2">{stats.pendingOffers}</p>
                    </div>
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                </div>
            </Card>

            {/* APPLICATIONS */}
            <Card
                className="p-6 shadow-sm cursor-pointer hover:bg-muted/40"
                onClick={() => router.push("/employers/applications")}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">Candidatures totales</p>
                        <p className="text-3xl font-bold mt-2">{stats.totalApplications}</p>
                    </div>
                    <div className="h-12 w-12 bg-accent/10 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-accent" />
                    </div>
                </div>
            </Card>

            {/* VIEWS */}
            <Card className="p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">Vues totales</p>
                        <p className="text-3xl font-bold mt-2">{stats.totalViews}</p>
                    </div>
                    <div className="h-12 w-12 bg-secondary/10 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-secondary" />
                    </div>
                </div>
            </Card>

        </div>
    );
}
