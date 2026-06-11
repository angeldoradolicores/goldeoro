import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendConfirmationEmail } from '@/lib/mail'

async function getSiteUrl(request: Request) {
  const host = request.headers.get('host')
  if (!host) return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https'
  return `${protocol}://${host}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    let email = (body.email || '').trim().toLowerCase()
    const fullName = body.fullName || ''

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email inválido.' }, { status: 400 })
    }

    const siteUrl = await getSiteUrl(request)
    const redirectTo = `${siteUrl}/auth/callback`

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'El servicio no está disponible.' }, { status: 500 })
    }

    const adminSupabase = createAdminClient()
    const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
      type: 'signup',
      email,
      password: null,
      options: {
        data: { full_name: fullName },
        redirectTo,
      },
    })

    if (linkError) {
      return NextResponse.json({ error: linkError.message }, { status: 400 })
    }

    if (!linkData?.properties?.action_link) {
      console.error('[resend] generateLink returned no action link', linkData)
      return NextResponse.json({ error: 'No se pudo generar el enlace de confirmación.' }, { status: 500 })
    }

    await sendConfirmationEmail(email, linkData.properties.action_link, fullName)
    return NextResponse.json({ success: true, message: 'Enlace de confirmación reenviado.' })
  } catch (err) {
    console.error('[resend] Unexpected error:', err)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
