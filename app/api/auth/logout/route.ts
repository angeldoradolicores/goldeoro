import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // 1. Obtener el usuario ANTES de cerrar sesión
    const { data: { user } } = await supabase.auth.getUser()

    // 2. No borrar el carrito al cerrar sesión. Sólo se cierra la sesión.
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('[logout] Sign out error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 4. Retornar éxito
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[logout] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}