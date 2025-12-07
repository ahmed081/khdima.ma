import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const categories = await prisma.jobCategory.findMany({
            orderBy: { name: "asc" },
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error("Error loading job categories:", error);
        return NextResponse.json(
            { error: "Unable to fetch job categories" },
            { status: 500 }
        );
    }
}
