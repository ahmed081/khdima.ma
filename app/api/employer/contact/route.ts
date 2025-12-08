import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromAuth } from "@/lib/auth";

export async function POST(req: Request) {
    const employer = await getUserFromAuth();
    if (!employer || employer.role !== "EMPLOYER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { candidateId, message } = await req.json();

    if (!candidateId || !message || message.trim().length === 0) {
        return NextResponse.json(
            { error: "Invalid payload" },
            { status: 400 }
        );
    }

    const candidate = await prisma.user.findUnique({
        where: { id: candidateId },
    });

    if (!candidate) {
        return NextResponse.json(
            { error: "Candidate not found" },
            { status: 404 }
        );
    }

    // Save employer → candidate message
    const saved = await prisma.message.create({
        data: {
            senderId: employer.id,
            receiverId: candidateId,
            content: message.trim(),
        },
    });

    return NextResponse.json({
        success: true,
        message: "Message sent",
        data: saved,
    });
}
