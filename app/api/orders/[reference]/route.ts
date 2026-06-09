import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getTransaction } from '@/lib/wompi'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params
    const supabase = await createClient()

    // Get order by reference — try UUID first (Wompi returns the order UUID as reference)
    // then fall back to order_number (LH-YYYYMMDD-XXXX format)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reference)
    
    const query = supabase
      .from('orders')
      .select(`*, items:order_items(*)`)
    
    const { data: order, error } = isUUID
      ? await query.eq('id', reference).maybeSingle()
      : await query.eq('order_number', reference).maybeSingle()

    if (error || !order) {
      console.error('[orders/reference] Not found:', reference, error?.message)
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    // If there's a Wompi transaction, check its status
    if (order.wompi_transaction_id) {
      try {
        const transaction = await getTransaction(order.wompi_transaction_id)
        
        // Update order status based on transaction
        if (transaction.status === 'APPROVED' && order.status === 'pending') {
          await supabase
            .from('orders')
            .update({ status: 'paid' })
            .eq('id', order.id)
          order.status = 'paid'
        } else if (transaction.status === 'DECLINED' || transaction.status === 'ERROR') {
          await supabase
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', order.id)
          order.status = 'cancelled'
        }

        return NextResponse.json({
          ...order,
          transactionStatus: transaction.status,
          transactionMessage: transaction.status_message,
        })
      } catch {
        // Transaction check failed, return order as is
        console.error('[v0] Failed to check transaction status')
      }
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('[v0] Order status API error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
