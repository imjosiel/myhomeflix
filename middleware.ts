// Next.js middleware for route protection
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

// Protected routes that require authentication
const protectedPaths = ['/dashboard', '/upload', '/videos/manage'];

// Admin-only routes
const adminPaths = ['/admin'];

// Moderator and editor routes
const contentCreatorPaths = ['/upload', '/videos/manage'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if the path requires authentication
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const isAdmin = adminPaths.some((path) => pathname.startsWith(path));
  const isContentCreator = contentCreatorPaths.some((path) => pathname.startsWith(path));

  if (!isProtected && !isAdmin && !isContentCreator) {
    return NextResponse.next();
  }

  const session = await auth();
  const roles = session?.user?.roles ?? [];

  // Not authenticated - redirect to login
  if (!session) {
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Check admin access
  if (isAdmin && !roles.includes('admin')) {
    const url = new URL('/dashboard', req.url);
    return NextResponse.redirect(url);
  }

  // Check content creator access (admin, moderador, editor)
  if (isContentCreator && !roles.some(r => ['admin', 'moderador', 'editor'].includes(r))) {
    const url = new URL('/dashboard', req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Apply middleware to specific routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/upload/:path*',
    '/videos/manage/:path*',
    '/admin/:path*',
  ],
};
