import { createClient } from '@/lib/supabase/server'
import PedidosClient from './PedidosClient'

export const dynamic = 'force-dynamic'

export default async function PedidosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userOrders: any[] = []
  if (user) {
    const { data } = await supabase
      .from('orders')
      .select('id, order_number, created_at, status, total, subtotal, shipping_cost, tracking_number, carrier, tracking_photo_url, admin_note, shipped_at, items:order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      
    if (data) {
      userOrders = data
    }
  }

  return (
    <PedidosClient 
      initialUser={user}
      initialOrders={userOrders}
    />
  )
}
