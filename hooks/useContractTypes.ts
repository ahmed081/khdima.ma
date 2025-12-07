import type {ContractType} from "@/types/constants"
import {useQuery} from "@tanstack/react-query";

export function useContractTypes() {
    return useQuery<ContractType[]>({
        queryKey: ["contract-types"],
        queryFn: async () => {
            const res = await fetch("/api/constants/contract-types")
            if (!res.ok) throw new Error("Erreur lors du chargement des types de contrat")
            return res.json()
        },
    })
}
