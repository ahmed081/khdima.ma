import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromAuth } from "@/lib/auth";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    const user = await getUserFromAuth();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;   // ⬅ MUST AWAIT
    const jobId = Number(id);

    if (isNaN(jobId)) {
        return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
    }

    const body = await req.json();

    // Check if already applied
    const existing = await prisma.application.findFirst({
        where: { jobId, userId: user.id },
    });

    if (existing) {
        return NextResponse.json(
            { error: "Vous avez déjà postulé à cette offre." },
            { status: 400 }
        );
    }

    // Create application
    const app = await prisma.application.create({
        data: {
            jobId,
            userId: user.id,
            coverLetter: body.coverLetter,
            cvUrl: body.cvUrl,
        },
    });

    return NextResponse.json({ success: true, application: app });
}
