import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // 1. Obtener el usuario ANTES de cerrar sesión
    const { data: { user } } = await supabase.auth.getUser()

    // 2. Limpiar el carrito en la BD mientras la sesión aún es válida (usar service role)
    if (user) {
      const { error: cartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)

      if (cartError) {
        console.error('[logout] Error clearing cart:', cartError.message)
        // No retornamos error aquí porque queremos continuar con el logout
      }
    }

    // 3. Ahora sí cerrar sesión
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