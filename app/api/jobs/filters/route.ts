import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const cities = await prisma.city.findMany({
            select: { name: true },
            orderBy: { name: "asc" },
        });

        const contracts = await prisma.contractType.findMany({
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        });

        // From your enums
        const jobTypes = ["FULL_TIME", "PART_TIME", "FREELANCE", "INTERNSHIP", "CONTRACT"];
        const jobModes = ["ONSITE", "REMOTE", "HYBRID"];

        const salaryRanges = [
            "0-5000",
            "5000-10000",
            "10000-15000",
            "15000-20000",
            "20000-30000",
            "30000-50000"
        ];

        return NextResponse.json({
            cities: cities.map((c) => c.name),
            contracts,
            salaryRanges,
            jobTypes,
            jobModes,
        });

    } catch (error) {
        console.error("FILTERS API ERROR:", error);
        return NextResponse.json(
            { error: "Erreur lors du chargement des filtres" },
            { status: 500 }
        );
    }
}
