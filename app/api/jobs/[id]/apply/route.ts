import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromAuth } from "@/lib/auth";
import {Context} from "node:vm";

export async function POST(
    req: Request,
    context : Context,
) {    const user = await getUserFromAuth();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const {id} = await context.params
    const jobId = Number(id);
    console.log("API ROUTE PARAMS:", context);
    if (isNaN(jobId)) {
        return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
    }
    const body = await req.json();

    const existing = await prisma.application.findFirst({
        where: { jobId, userId: user.id },
    });

    if (existing) {
        return NextResponse.json(
            { error: "Vous avez déjà postulé à cette offre." },
            { status: 400 }
        );
    }

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
