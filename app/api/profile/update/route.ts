import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromAuth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
    try {
        const auth = await getUserFromAuth();
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        let updatedData: any = {
            name: body.name,
        };

        if (body.password) {
            const hashed = await bcrypt.hash(body.password, 10);
            updatedData.password = hashed;
        }

        const updatedUser = await prisma.user.update({
            where: { id: auth.id },
            data: updatedData,
            select: { id: true, email: true, name: true, role: true },
        });

        return NextResponse.json(updatedUser);

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
