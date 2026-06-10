import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function PUT(request: Request) {
  try {
    const serverSupabase = await createClient()
    const { data: { user } } = await serverSupabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { fullName, phone, birthDate } = await request.json()
    if (!fullName && phone === undefined && birthDate === undefined) {
      return NextResponse.json({ error: 'No hay datos para actualizar' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ full_name: fullName, phone: phone || null, birth_date: birthDate || null, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (error) {
      console.error('[profile] update error', error)
      return NextResponse.json({ error: 'Error al actualizar perfil' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[profile] route error', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
