import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import {prisma} from "@/lib/prisma";

const handler = NextAuth({
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: {},
                password: {},
            },
            async authorize(credentials) {
                const user = await prisma.user.findUnique({
                    where: {email: credentials!.email},
                });

                if (!user) return null;

                const passwordMatch = bcrypt.compare(
                    credentials!.password,
                    user.password
                );

                if (!passwordMatch) return null;

                return user;
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
});

export {handler as GET, handler as POST};
