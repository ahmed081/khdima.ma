"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function DashboardHeader() {
    return (
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-3xl font-bold mb-2">Tableau de bord employeur</h1>
                <p className="text-muted-foreground">Gérez vos offres et candidatures</p>
            </div>

            <Link href="/employers/post-job">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Publier une offre
                </Button>
            </Link>
        </div>
    );
}
