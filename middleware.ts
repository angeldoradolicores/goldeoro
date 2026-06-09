import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware using Supabase SSR to refresh session cookies on every request.
 * This is REQUIRED so the auth token stays alive across page navigations.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session — this keeps the user logged in across navigations
  const { data: { user } } = await supabase.auth.getUser()

  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin') && !user) {
    const login = request.nextUrl.clone()
    login.pathname = '/auth/login'
    login.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(login)
  }

  // Protect /perfil routes
  if (request.nextUrl.pathname.startsWith('/perfil') && !user) {
    const login = request.nextUrl.clone()
    login.pathname = '/auth/login'
    login.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(login)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
