import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const levels = await prisma.experienceLevel.findMany();

        return NextResponse.json(levels);
    } catch (error) {
        console.error("Error loading experience levels:", error);
        return NextResponse.json(
            { error: "Unable to fetch experience levels" },
            { status: 500 }
        );
    }
}
