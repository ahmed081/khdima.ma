import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const handler = NextAuth({
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) return null;

                const passwordMatch = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!passwordMatch) return null;

                // ✅ Return NextAuth-compatible user (id must be string) + no password
                return {
                    id: String(user.id),
                    name: user.name,
                    email: user.email,
                    role: user.role, // optional extra field
                } as any;
            },
        }),
    ],
    session: { strategy: "jwt" },
});

export { handler as GET, handler as POST };
