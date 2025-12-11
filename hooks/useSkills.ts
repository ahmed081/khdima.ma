import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/axios"
import { SkillContext } from "@/types/database"

async function getSkillContexts(): Promise<SkillContext[]> {
    const res = await api.get<SkillContext[]>("/constants/skills")
    return res.data
}

export function useSkills() {
    return useQuery<SkillContext[]>({
        queryKey: ["skillContexts"],
        queryFn: getSkillContexts,
    })
}
