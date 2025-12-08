"use client";

import { useForm } from "react-hook-form";
import { useApplyToJob } from "@/hooks/useApplyToJob";
import { Button } from "@/components/ui/button";

export default function ApplyForm({ jobId }: { jobId: number }) {
    const { register, handleSubmit, formState } = useForm();
    const { errors } = formState;

    const mutation = useApplyToJob(jobId, {
        onSuccess: () => {
            alert("Votre candidature a été envoyée !");
        },
    });

    const onSubmit = (data: any) => {
        mutation.mutate(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 bg-card shadow rounded-xl">

            {/* Cover Letter */}
            <div>
                <label className="block mb-1 font-medium">Lettre de motivation</label>
                <textarea
                    {...register("coverLetter")}
                    className="textarea textarea-bordered w-full"
                    rows={5}
                />
            </div>

            {/* CV URL (temporary, until real file upload) */}
            <div>
                <label className="block mb-1 font-medium">CV (URL ou upload plus tard)</label>
                <input
                    {...register("cvUrl")}
                    className="input input-bordered w-full"
                    placeholder="https://..."
                />
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full bg-primary text-white" disabled={mutation.isPending}>
                {mutation.isPending ? "Envoi..." : "Envoyer la candidature"}
            </Button>

            {/* Error message */}
            {mutation.isError && (
                <p className="text-red-500 text-sm mt-2">{(mutation.error as Error).message}</p>
            )}

        </form>
    );
}
