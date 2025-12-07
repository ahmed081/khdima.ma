"use client"

import { useQuery } from "@tanstack/react-query"

export function useCities(countryId?: number) {
    return useQuery({
        queryKey: ["cities", countryId],
        queryFn: async () => {
            const res = await fetch(`/api/constants/cities?countryId=${countryId}`)
            if (!res.ok) throw new Error("Erreur lors du chargement des villes")
            return res.json()
        },
        enabled: !!countryId, // 🔥 Only fetch when countryId is selected
    })
}
