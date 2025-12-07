"use client"

import { useQuery } from "@tanstack/react-query"

export function useSkills() {
    return useQuery({
        queryKey: ["skills"],
        queryFn: async () => {
            const res = await fetch("/api/constants/skills")
            if (!res.ok) throw new Error("Erreur lors du chargement des compétences")
            return res.json()
        },
    })
}
