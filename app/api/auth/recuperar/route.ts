import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPasswordResetEmail } from '@/lib/mail'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = (body.email || '').trim().toLowerCase()

    if (!email) {
      return NextResponse.json({ error: 'Email requerido.' }, { status: 400 })
    }

    const host = request.headers.get('host')
    const protocol = host?.includes('localhost') || host?.includes('127.0.0.1') ? 'http' : 'https'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host || 'localhost:3000'}`
    const redirectTo = `${siteUrl}/auth/callback?next=/auth/reset-password`

    const adminSupabase = createAdminClient()
    const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo,
      },
    })

    if (linkError) {
      console.error('[reset-password] Error generating link:', linkError.message)
      // Return success anyway to prevent email enumeration attacks
      return NextResponse.json({ success: true })
    }

    if (linkData?.properties?.action_link) {
      await sendPasswordResetEmail(email, linkData.properties.action_link)
    }

    return NextResponse.json({ success: true, message: 'Correo enviado.' })
  } catch (error) {
    console.error('[reset-password] Unexpected error:', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
