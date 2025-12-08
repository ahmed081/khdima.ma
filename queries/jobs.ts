import { api } from "@/lib/axios"

export async function searchJobs(filters: {
    search?: string
    city?: string
    jobType?: string
    salaryRange?: string
}) {
    const res = await api.post("/jobs/search", filters)
    return res.data
}

export async function getFeaturedJobs() {
    const res = await api.get("/jobs/featured")
    return res.data
}

export async function createJob(payload: any) {
    const res = await api.post("/jobs/create", payload)
    return res.data
}

export async function getJobFilters() {
    const res = await fetch("/api/jobs/filters");
    if (!res.ok) throw new Error("Erreur chargement filtres");
    return res.json();
}