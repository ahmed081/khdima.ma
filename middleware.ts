import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {NextRequest, NextResponse} from 'next/server';
import jwt from 'jsonwebtoken';

const handleI18n = createMiddleware(routing);

const PROTECTED_PATHS = ['/dashboard', '/employers', '/profile'];

function getLocale(pathname: string): string {
  const match = pathname.match(/^\/(fr|en|ar)(\/|$)/);
  return match?.[1] ?? routing.defaultLocale;
}

function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(fr|en|ar)/, '') || '/';
}

export function middleware(req: NextRequest) {
  const {pathname} = req.nextUrl;

  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const locale = getLocale(pathname);
  const actualPath = stripLocale(pathname);

  const isProtected = PROTECTED_PATHS.some(p => actualPath === p || actualPath.startsWith(p + '/'));

  if (isProtected) {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }
    try {
      const user: any = jwt.verify(token, process.env.JWT_SECRET!);

      if (actualPath.startsWith('/employers') && user.role !== 'EMPLOYER') {
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
      }
      if (actualPath.startsWith('/dashboard') && user.role === 'EMPLOYER') {
        return NextResponse.redirect(new URL(`/${locale}/employers/dashboard`, req.url));
      }
      if (actualPath.startsWith('/jobs') && user.role === 'EMPLOYER') {
        return NextResponse.redirect(new URL(`/${locale}/employers/jobs`, req.url));
      }
    } catch {
      return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }
  }

  return handleI18n(req);
}

export const config = {
  matcher: ['/((?!_next|_vercel|[^/]+\\.[^/]+).*)']
};
