import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

const PUBLIC_PATHS = ["/login", "/register", "/", "/api/auth","/jobs","/jobs/:path"]

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    // Public routes → allow
    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
        return NextResponse.next()
    }

    const token = req.cookies.get("khidma_session")?.value
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET!)
        return NextResponse.next()
    } catch (err) {
        return NextResponse.redirect(new URL("/login", req.url))
    }
}

export const config = {
    matcher: ["/dashboard/:path*", "/profile/:path*"],
}
