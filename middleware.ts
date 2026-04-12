
import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Add auth protection logic here if needed
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
