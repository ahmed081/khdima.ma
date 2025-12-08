"use client";

import { useMutation } from "@tanstack/react-query";

export function useApplyToJob(jobId: number, options?: { onSuccess?: () => void }) {
    return useMutation({
        mutationFn: async (values: any) => {
            const res = await fetch(`/api/jobs/${jobId}/apply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Application failed");
            }

            return res.json();
        },
        onSuccess: () => options?.onSuccess?.(),
    });
}
