"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export interface JobFormValues {
    title: string;
    description: string;
    salary?: number | string;
    status?: "ACTIVE" | "CLOSED";
}

interface JobFormProps {
    defaultValues?: Partial<JobFormValues>;
    onSubmit: (values: JobFormValues) => void;
    submitting?: boolean;
}

export function JobForm({
                            defaultValues,
                            onSubmit,
                            submitting = false,
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

    useEffect(() => {
        if (!defaultValues) return;

        Object.entries(defaultValues).forEach(([key, value]) => {
            // @ts-ignore
            setValue(key, value);
        });
    }, [defaultValues, setValue]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Title */}
            <div>
                <Label>Titre</Label>
                <Input placeholder="Exemple : Développeur Full Stack" {...register("title")} />
            </div>

            {/* Description */}
            <div>
                <Label>Description</Label>
                <Textarea rows={6} placeholder="Décrivez le poste..." {...register("description")} />
            </div>

            {/* Salary */}
            <div>
                <Label>Salaire</Label>
                <Input type="number" placeholder="Ex: 8000" {...register("salary")} />
            </div>

            {/* Status */}
            <div>
                <Label>Status</Label>
                <select
                    {...register("status")}
                    className="border w-full rounded-md p-2 bg-background"
                >
                    <option value="ACTIVE">Active</option>
                    <option value="CLOSED">Fermée</option>
                </select>
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
        </form>
    );
}
