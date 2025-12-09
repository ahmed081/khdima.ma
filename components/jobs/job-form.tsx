"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

export interface JobFormValues {
    title: string;
    description: string;
    salary?: number | string;
    status?: "ACTIVE" | "CLOSED";
}

interface JobFormProps {
    /** Default values when editing */
    defaultValues?: Partial<JobFormValues>;

    /** Called when user submits the form */
    onSubmit: (values: JobFormValues) => void;

    /** Loading state for submit button */
    submitting?: boolean;

    /** Called when user confirms delete (edit mode only) */
    onDelete?: () => void;

    /** Whether this form is used to edit an existing job */
    isEditing?: boolean;
}

export function JobForm({
                            defaultValues,
                            onSubmit,
                            submitting = false,
                            onDelete,
                            isEditing = false,
                        }: JobFormProps) {
    const { register, handleSubmit, setValue } = useForm<JobFormValues>({
        defaultValues: {
            title: "",
            description: "",
            salary: "",
            status: "ACTIVE",
            ...defaultValues,
        },
    });

    const [confirmDelete, setConfirmDelete] = useState(false);

    /** Hydrate form values when editing */
    useEffect(() => {
        if (!defaultValues) return;
        Object.entries(defaultValues).forEach(([key, value]) =>
            // @ts-ignore
            setValue(key, value)
        );
    }, [defaultValues, setValue]);

    return (
        <>
            {/* FORM */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Title */}
                <div className="space-y-1">
                    <Label>Titre de l'offre</Label>
                    <Input
                        placeholder="Exemple : Développeur Full Stack"
                        {...register("title")}
                    />
                </div>

                {/* Description */}
                <div className="space-y-1">
                    <Label>Description du poste</Label>
                    <Textarea
                        rows={7}
                        placeholder="Décrivez le poste en détail…"
                        {...register("description")}
                    />
                </div>

                {/* Salary */}
                <div className="space-y-1">
                    <Label>Salaire (MAD)</Label>
                    <Input
                        type="number"
                        placeholder="Ex : 8000"
                        {...register("salary")}
                    />
                </div>

                {/* Status */}
                <div className="space-y-1">
                    <Label>Status</Label>
                    <select
                        {...register("status")}
                        className="border rounded-md p-2 bg-background w-full"
                    >
                        <option value="ACTIVE">Active</option>
                        <option value="CLOSED">Fermée</option>
                    </select>
                </div>

                {/* Submit Button */}
                <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? "Enregistrement…" : "Enregistrer"}
                </Button>

                {/* Delete Button (edit only) */}
                {isEditing && onDelete && (
                    <Button
                        type="button"
                        variant="destructive"
                        className="w-full"
                        onClick={() => setConfirmDelete(true)}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer l'offre
                    </Button>
                )}
            </form>

            {/* DELETE CONFIRMATION MODAL */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="p-6 w-80 bg-white rounded-lg shadow-xl space-y-4">
                        <p className="text-center font-medium">
                            Voulez-vous vraiment supprimer cette offre ?
                        </p>

                        <div className="flex justify-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setConfirmDelete(false)}
                            >
                                Annuler
                            </Button>

                            <Button
                                variant="destructive"
                                onClick={() => {
                                    setConfirmDelete(false);
                                    onDelete?.();
                                }}
                            >
                                Supprimer
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </>
    );
}
