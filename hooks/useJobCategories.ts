// hooks/useJobCategories.ts
"use client"
import { useQuery } from "@tanstack/react-query"

export function useJobCategories() {
    return useQuery({
        queryKey: ["job-categories"],
        queryFn: async () => {
            const res = await fetch("/api/constants/job-categories")
            if (!res.ok) throw new Error("Erreur chargement catégories")
            return res.json()
        },
    })
}
