"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useUpdateJobStatus } from "@/hooks/useUpdateJobStatus";
import { toast } from "@/hooks/use-toast";

export function DeleteJobButton({ jobId }: { jobId: number }) {
    const router = useRouter();
    const [confirm, setConfirm] = useState(false);

    const mutation = useUpdateJobStatus(jobId, () => {
        toast({
            title: "Offre supprimée",
            description: "L’offre a été supprimée.",
        });
        router.push("/employers/jobs");
    });

    const handleDelete = () => {
        mutation.mutate("DELETED"); // 🔥 Use your existing enum
    };

    return (
        <>
            <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirm(true)}
            >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
            </Button>

            {confirm && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg z-50">
                    <Card className="p-6 bg-white space-y-4 w-72 shadow-xl">
                        <p className="text-center font-semibold">
                            Supprimer cette offre ?
                        </p>

                        <div className="flex gap-2 justify-center">
                            <Button variant="outline" onClick={() => setConfirm(false)}>
                                Annuler
                            </Button>

                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={mutation.isPending}
                            >
                                {mutation.isPending ? "Suppression..." : "Supprimer"}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </>
    );
}
