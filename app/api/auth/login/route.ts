import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')

  let email: string | null = null
  let password: string | null = null
  let redirectTo = '/'

  if (isJson) {
    const body = await request.json()
    email = body.email as string
    password = body.password as string
    redirectTo = body.redirectTo || '/'
  } else {
    const formData = await request.formData()
    email = formData.get('email')?.toString() ?? null
    password = formData.get('password')?.toString() ?? null
    redirectTo = formData.get('redirectTo')?.toString() || '/'
  }

  if (!email || !password) {
    if (isJson) {
      return NextResponse.json({ error: 'Email y contrasena son requeridos' }, { status: 400 })
    }

    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('error', 'Email y contrasena son requeridos')
    loginUrl.searchParams.set('redirect', redirectTo)
    return NextResponse.redirect(loginUrl)
  }

  let response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookieHeader = request.headers.get('cookie') ?? ''
          return cookieHeader
            .split('; ')
            .filter(Boolean)
            .map((cookie) => {
              const [name, ...rest] = cookie.split('=')
              return { name, value: rest.join('=') }
            })
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            if (options) {
              const opts: any = { path: options.path, httpOnly: options.httpOnly, secure: options.secure, sameSite: options.sameSite, maxAge: options.maxAge, domain: options.domain }
              response.cookies.set(name, value, opts)
            } else {
              response.cookies.set(name, value)
            }
          })
        },
      },
    }
  )

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (isJson) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('error', error.message)
    loginUrl.searchParams.set('redirect', redirectTo)
    response = NextResponse.redirect(loginUrl)
    return response
  }

  if (isJson) {
    return response.json({ success: true })
  }

  const redirectUrl = new URL(redirectTo, request.url)
  response = NextResponse.redirect(redirectUrl)
  return response
}
