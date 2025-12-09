"use client";

import { useState } from "react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Bookmark, Clock, Edit, Eye, MapPin, Trash2,
    TrendingUp, Users
} from "lucide-react";

import { useUpdateJobStatus } from "@/hooks/useUpdateJobStatus";
import { toast } from "@/hooks/use-toast";

export function JobCard({ job, variant = "public" }: { job: any; variant?: "public" | "employer" }) {
    const isEmployer = variant === "employer";

    const [confirmDelete, setConfirmDelete] = useState(false);

    const updateStatus = useUpdateJobStatus(job.id, () => {
        toast({
            title: "Succès",
            description: "Statut mis à jour !",
        });
        setConfirmDelete(false);
    });

    const handleDelete = () => {
        updateStatus.mutate("DELETED");
    };

    return (
        <Card className="group transition-all hover:shadow-lg relative">
            <CardContent className="p-6">

                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="mb-2 text-lg font-semibold group-hover:text-primary">
                            {job.title}
                        </h3>

                        {!isEmployer && (
                            <p className="mb-3 text-sm text-muted-foreground">
                                {job.employer?.companyName ?? "Entreprise"}
                            </p>
                        )}
                    </div>

                    {!isEmployer && (
                        <Button variant="ghost" size="icon">
                            <Bookmark className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Meta information */}
                <div className="mb-4 space-y-2">
                    {!isEmployer && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{job.city?.name ?? "—"}</span>
                            <span className="mx-1">•</span>
                            <Badge variant="secondary" className="text-xs">
                                {job.contractType?.name ?? "Contrat"}
                            </Badge>
                        </div>
                    )}

                    {!isEmployer && job.salary && (
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <span>{job.salary}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>

                    {isEmployer && (
                        <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                            <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {job._count?.applications ?? 0} candidatures
                            </div>

                            <div className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4" />
                                {job.views ?? 0} vues
                            </div>

                            <Badge className={job.status === "ACTIVE" ? "bg-green-500/10 text-green-700" : "bg-gray-300"}>
                                {job.statusLibele }
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                    {!isEmployer && (
                        <Link href={`/jobs/${job.id}`} className="w-full">
                            <Button className="w-full">Voir l'offre</Button>
                        </Link>
                    )}

                    {isEmployer && (
                        <>
                            <Link href={`/jobs/${job.id}`} className="flex-1">
                                <Button variant="outline" className="w-full">
                                    <Eye className="h-4 w-4 mr-2" /> Voir
                                </Button>
                            </Link>

                            <Link href={`/employers/jobs/${job.id}/edit`} className="flex-1">
                                <Button variant="outline" className="w-full">
                                    <Edit className="h-4 w-4 mr-2" /> Modifier
                                </Button>
                            </Link>

                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => setConfirmDelete(true)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </div>
            </CardContent>

            {/* DELETE CONFIRMATION */}
            {confirmDelete && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <Card className="p-6 bg-white space-y-4 w-72">
                        <p className="text-center">Supprimer cette offre ?</p>

                        <div className="flex gap-2 justify-center">
                            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                                Annuler
                            </Button>

                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={updateStatus.isPending}
                            >
                                {updateStatus.isPending ? "Suppression..." : "Supprimer"}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </Card>
    );
}
