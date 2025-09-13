import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/job-prep/:path*',
    '/resume/:path*',
    '/analytics/:path*',
  ],
}