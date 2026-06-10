import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params
    if (!orderId) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

    // verify admin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile?.is_admin) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })

    const supabaseAdmin = createAdminClient()

    const { data: history, error } = await supabaseAdmin
      .from('notifications')
      .select('id, title, message, type, created_at')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ history: history || [] })
  } catch (err) {
    console.error('[admin/orders/history] error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
