"use client"

import { useQuery } from "@tanstack/react-query"
import { getFeaturedJobs } from "@/queries/jobs"
import type { FeaturedJob } from "@/types/job"

export function useFeaturedJobs() {
    return useQuery<FeaturedJob[]>({
        queryKey: ["featured-jobs"],
        queryFn: getFeaturedJobs,
    })
}
