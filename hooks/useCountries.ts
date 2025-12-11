import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/axios"
import { Country } from "@/types/database"

async function getCountries(): Promise<Country[]> {
    const res = await api.get<Country[]>("/constants/countries")
    return res.data
}

export function useCountries() {
    return useQuery<Country[]>({
        queryKey: ["countries"],
        queryFn: getCountries,
    })
}
