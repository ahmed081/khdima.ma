import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/axios"
import { ContractType } from "@/types/database"

async function getContractTypes(): Promise<ContractType[]> {
    const res = await api.get<ContractType[]>("/constants/contract-types")
    return res.data
}

export function useContractTypes() {
    return useQuery<ContractType[]>({
        queryKey: ["contractTypes"],
        queryFn: getContractTypes,
    })
}
