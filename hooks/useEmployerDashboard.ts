"use client";

import { useQuery } from "@tanstack/react-query";

export function useEmployerDashboard() {
    return useQuery({
        queryKey: ["employerDashboard"],
        queryFn: async () => {
            const res = await fetch("/api/employers/dashboard");
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || "Failed to load dashboard");
            }
            return res.json();
        },
    });
}