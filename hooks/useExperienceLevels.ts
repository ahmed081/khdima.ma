"use client"

import { useQuery } from "@tanstack/react-query"

export function useExperienceLevels() {
    return useQuery({
        queryKey: ["experience-levels"],
        queryFn: async () => {
            const res = await fetch("/api/constants/experience-levels")
            if (!res.ok) throw new Error("Failed to load experience levels")
            return res.json()
        },
    })
}
