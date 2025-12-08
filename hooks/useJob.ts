import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export interface JobSkill {
    id: number;
    name: string;
}

export interface JobDetail {
    id: number;
    title: string;
    description: string;
    salary: string | null;
    location: string | null;
    type: string;
    createdAt: string;
    benefits: string[];
    requirements: string[];
    responsibilities: string[];
    employer: {
        id: number;
        companyName: string | null;
    };
    skills: JobSkill[];
    status?: string;
    view?: number;
}

async function fetchJob(id: number): Promise<JobDetail> {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
}

export function useJob(jobId: number) {
    return useQuery({
        queryKey: ["job", jobId],
        queryFn: () => fetchJob(jobId),
        enabled: !!jobId,
    });
}
