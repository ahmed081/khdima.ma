import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/axios"
import { City } from "@/types/database"

async function getCities(countryId: number): Promise<City[]> {
    const res = await api.get<City[]>(`/constants/cities/${countryId}`)
    return res.data
}

export function useCities(countryId: number) {
    return useQuery<City[]>({
        queryKey: ["cities", countryId],
        queryFn: () => getCities(countryId),
        enabled: !!countryId, // ensures query runs only when countryId exists
    })
}
