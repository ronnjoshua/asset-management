export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/pets/:path*',
    '/products/:path*',
    '/equipment/:path*',
    '/categories/:path*',
    '/settings/:path*',
  ],
};
