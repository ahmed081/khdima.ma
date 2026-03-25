import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {NextRequest, NextResponse} from 'next/server';
import { jwtVerify } from 'jose';

const handleI18n = createMiddleware(routing);

const PROTECTED_PATHS = ['/profile', '/provider/dashboard', '/admin'];

function getLocale(pathname: string): string {
  const match = pathname.match(/^\/(fr|en|ar)(\/|$)/);
  return match?.[1] ?? routing.defaultLocale;
}

function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(fr|en|ar)/, '') || '/';
}

export async function middleware(req: NextRequest) {
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
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      const { payload } = await jwtVerify(token, secret);

      if (actualPath.startsWith('/admin') && payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL(`/${locale}/`, req.url));
      }
      if (actualPath.startsWith('/provider/dashboard') && payload.role !== 'PROVIDER') {
        return NextResponse.redirect(new URL(`/${locale}/`, req.url));
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
