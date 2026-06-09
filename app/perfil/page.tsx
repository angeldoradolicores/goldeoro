import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PerfilClient from './PerfilClient'

export const dynamic = 'force-dynamic'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Load profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // Load orders
  const { data: userOrders } = await supabase
    .from('orders')
    .select('id, order_number, created_at, status, total, subtotal, shipping_cost, tracking_number, carrier, tracking_photo_url, admin_note, shipped_at, items:order_items(product_name, quantity, price, color, size)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Load addresses
  const { data: userAddresses } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })

  return (
    <PerfilClient 
      initialUser={user}
      initialProfile={profile}
      initialOrders={userOrders || []}
      initialAddresses={userAddresses || []}
    />
  )
}
