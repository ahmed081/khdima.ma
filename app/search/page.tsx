"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

import { Search, MapPin, Briefcase, DollarSign } from "lucide-react";

import { searchJobs, getJobFilters } from "@/queries/jobs";
import { JobCard } from "@/components/jobs/job-card";

export default function SearchPage() {
    const [filters, setFilters] = useState({
        search: "",
        city: "",
        contract: "",
        salaryRange: "",
    });

    const [shouldSearch, setShouldSearch] = useState(false);

    // Fetch filter options (cities, contract types, salary ranges)
    const { data: filterData, isLoading: filtersLoading } = useQuery({
        queryKey: ["job-filters"],
        queryFn: getJobFilters,
    });

    // Trigger search only when clicking "Rechercher"
    const {
        data: jobs = [],
        isLoading: jobsLoading,
        refetch,
    } = useQuery({
        queryKey: ["jobs-search", filters],
        queryFn: () => searchJobs(filters),
        enabled: shouldSearch,
    });

    function updateFilter(key: string, value: string) {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSearch() {
        setShouldSearch(true);
        refetch();
    }

    return (
        <div className="min-h-screen bg-muted/20">
            <main>

                {/* FILTER AREA */}
                <section className="border-b bg-background py-8">
                    <div className="container mx-auto px-4">

                        <h1 className="mb-6 text-3xl font-bold">Rechercher des offres d'emploi</h1>

                        {/* FILTER ROW */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">

                            {/* Search Input */}
                            <div className="flex items-center gap-3 rounded-lg border px-4 py-3 lg:col-span-2">
                                <Search className="h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="Titre du poste..."
                                    value={filters.search}
                                    onChange={(e) => updateFilter("search", e.target.value)}
                                    className="border-0 bg-transparent p-0"
                                />
                            </div>

                            {/* City */}
                            <Select
                                disabled={filtersLoading}
                                value={filters.city}
                                onValueChange={(v) => updateFilter("city", v)}
                            >
                                <SelectTrigger>
                                    <MapPin className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Ville" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filterData?.cities?.map((city: string) => (
                                        <SelectItem key={city} value={city}>
                                            {city}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Contract Type */}
                            <Select
                                disabled={filtersLoading}
                                value={filters.contract}
                                onValueChange={(v) => updateFilter("contract", v)}
                            >
                                <SelectTrigger>
                                    <Briefcase className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Contrat" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filterData?.contracts?.map((ct: any) => (
                                        <SelectItem key={ct.id} value={ct.name}>
                                            {ct.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Search button */}
                            <Button onClick={handleSearch} disabled={jobsLoading}>
                                {jobsLoading ? (
                                    <div className="flex items-center gap-2">
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Recherche...
                                    </div>
                                ) : (
                                    "Rechercher"
                                )}
                            </Button>
                        </div>

                        {/* Salary Range */}
                        <div className="mt-4">
                            <Select
                                disabled={filtersLoading}
                                value={filters.salaryRange}
                                onValueChange={(v) => updateFilter("salaryRange", v)}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Salaire" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filterData?.salaryRanges?.map((range: string) => (
                                        <SelectItem key={range} value={range}>
                                            {range.replace("-", " - ")} MAD
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                    </div>
                </section>

                {/* RESULTS */}
                <section className="py-12">
                    <div className="container mx-auto px-4">

                        {shouldSearch && !jobsLoading && (
                            <p className="text-muted-foreground">
                                {jobs.length} offres trouvées
                            </p>
                        )}

                        <div className="grid gap-6 mt-6">
                            {jobsLoading && (
                                <p className="text-muted-foreground">Recherche en cours...</p>
                            )}

                            {!jobsLoading &&
                                jobs.map((job: any) => (
                                    <JobCard key={job.id} job={job} variant="public" />
                                ))}
                        </div>

                    </div>
                </section>
            </main>
        </div>
    );
}
