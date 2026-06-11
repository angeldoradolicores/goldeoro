import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
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
      const errorMsg = 'Email y contraseña son requeridos'
      console.error('[login POST] Validation error:', errorMsg)
      
      if (isJson) {
        return NextResponse.json({ error: errorMsg }, { status: 400 })
      }

      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('error', errorMsg)
      loginUrl.searchParams.set('redirect', redirectTo)
      return NextResponse.redirect(loginUrl)
    }

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const errorMsg = 'Configuración del servidor incompleta'
      console.error('[login POST] Missing env vars')
      
      if (isJson) {
        return NextResponse.json({ error: errorMsg }, { status: 500 })
      }
      
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('error', errorMsg)
      return NextResponse.redirect(loginUrl)
    }

    let response = NextResponse.next()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
                const opts: any = { 
                  path: options.path, 
                  httpOnly: options.httpOnly, 
                  secure: options.secure, 
                  sameSite: options.sameSite, 
                  maxAge: options.maxAge, 
                  domain: options.domain 
                }
                response.cookies.set(name, value, opts)
              } else {
                response.cookies.set(name, value)
              }
            })
          },
        },
      }
    )

    console.log('[login POST] Attempting sign in for:', email)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('[login POST] Sign in error:', error.message, error.code)
      
      if (isJson) {
        return NextResponse.json({ 
          error: error.message || 'Error al iniciar sesión',
          code: error.code
        }, { status: 401 })
      }

      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('error', error.message || 'Error al iniciar sesión')
      loginUrl.searchParams.set('redirect', redirectTo)
      response = NextResponse.redirect(loginUrl)
      return response
    }

    console.log('[login POST] Sign in successful for:', email)

    if (isJson) {
      return NextResponse.json({ success: true })
    }

    const redirectUrl = new URL(redirectTo, request.url)
    response = NextResponse.redirect(redirectUrl)
    return response
  } catch (err) {
    console.error('[login POST] Unexpected error:', err)
    
    const errorMsg = err instanceof Error ? err.message : 'Error interno del servidor'
    
    if (request.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json({ error: errorMsg }, { status: 500 })
    }
    
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('error', 'Error interno: ' + errorMsg)
    return NextResponse.redirect(loginUrl)
  }
}
