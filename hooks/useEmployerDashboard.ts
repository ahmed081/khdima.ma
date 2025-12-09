"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { EmployerDashboardResponse } from "@/types/dashboard";

export function useEmployerDashboard() {
    return useQuery<EmployerDashboardResponse>({
        queryKey: ["employerDashboard"],
        queryFn: async () => {
            const res = await api.get<EmployerDashboardResponse>("/employers/dashboard");
            return res.data;
        },
    });
}
