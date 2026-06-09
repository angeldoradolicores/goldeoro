import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
    if (!profile?.is_admin) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })

    const supabaseAdmin = createAdminClient()
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, created_at, total, status, tracking_number, carrier, shipping_address')
      .eq('user_id', clientId)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ orders: orders || [] })
  } catch (error) {
    console.error('[admin/clients/:id/orders] error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
