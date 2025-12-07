"use client"

import { useQuery } from "@tanstack/react-query"

export function useCountries() {
    return useQuery({
        queryKey: ["countries"],
        queryFn: async () => {
            const res = await fetch("/api/constants/countries")
            if (!res.ok) throw new Error("Erreur lors du chargement des pays")
            return res.json()
        },
    })
}
