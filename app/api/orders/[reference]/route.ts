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

    // Get order by reference
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .eq('order_number', reference)
      .single()

    if (error || !order) {
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
