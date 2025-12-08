import { NextResponse } from "next/server";
import { getUserFromAuth } from "@/lib/auth";

export async function GET() {
    const user = await getUserFromAuth();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Remove sensitive fields
    const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName ?? null,
        createdAt: user.createdAt,
    };

    return NextResponse.json(safeUser);
}
