import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const PUBLIC_PATHS = [
    "/",
    "/login",
    "/register",
    "/jobs",
    "/api/auth/login",
    "/api/auth/register",
    "/api/jobs",
];

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Allow access to all public pages
    if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // Check JWT
    const token = req.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    let user: any = null;
    try {
        user = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // EMPLOYER AREA PROTECTION
    if (pathname.startsWith("/employers") && user.role !== "EMPLOYER") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // USER AREA PROTECTION
    if (pathname.startsWith("/dashboard") && user.role === "EMPLOYER") {
        return NextResponse.redirect(new URL("/employers/dashboard", req.url));
    }

    // PREVENT EMPLOYER FROM ACCESSING USER JOB PAGES
    if (pathname.startsWith("/jobs") && user.role === "EMPLOYER") {
        return NextResponse.redirect(new URL("/employers/jobs", req.url));
    }

    return NextResponse.next();
}

// Only match these routes
export const config = {
    matcher: [
        "/dashboard/:path*",
        "/employers/:path*",
        "/jobs/:path*",
    ],
};
