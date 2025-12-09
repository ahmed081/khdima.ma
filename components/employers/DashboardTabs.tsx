"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OfferList } from "./OfferList";


import { EmployerJob, Applicant } from "@/types/dashboard";
import {ApplicantList} from "@/components/employers/ApplicantList";

export function DashboardTabs({
                                  offers,
                                  applicants,
                              }: {
    offers: EmployerJob[];
    applicants: Applicant[];
}) {
    return (
        <Tabs defaultValue="offers" className="space-y-4">

            <TabsList className="bg-muted mb-4">
                <TabsTrigger value="offers">Mes offres</TabsTrigger>
                <TabsTrigger value="applicants">Candidatures</TabsTrigger>
            </TabsList>

            <TabsContent value="offers">
                <OfferList offers={offers} />
            </TabsContent>

            <TabsContent value="applicants">
                <ApplicantList applicants={applicants} />
            </TabsContent>

        </Tabs>
    );
}
