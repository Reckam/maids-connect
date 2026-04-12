
import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Simple pass-through middleware since Firebase handles auth client-side in this architecture
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
