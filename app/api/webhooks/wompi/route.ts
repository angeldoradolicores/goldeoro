import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/wompi'
import { sendOrderStatusEmail } from '@/lib/mail'

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-wompi-signature')
    const timestamp = request.headers.get('x-wompi-timestamp')
    const payload = await request.text()

    // Verify webhook signature
    if (signature && timestamp) {
      const isValid = verifyWebhookSignature(payload, signature, timestamp)
      if (!isValid) {
        console.error('[wompi-webhook] Invalid webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const data = JSON.parse(payload)
    const event = data.event
    const transaction = data.data?.transaction

    if (!transaction) {
      return NextResponse.json({ error: 'No transaction data' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()

    // Find order by reference (which is UUID) or fallback to order_number
    let { data: order, error: findError } = await supabaseAdmin
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', transaction.reference)
      .maybeSingle()

    if (!order) {
      // Fallback search by order_number
      const fallbackQuery = await supabaseAdmin
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('order_number', transaction.reference)
        .maybeSingle()
      order = fallbackQuery.data
    }

    if (findError || !order) {
      console.error('[wompi-webhook] Order not found for reference:', transaction.reference)
      return NextResponse.json({ received: true })
    }

    // Update order based on event
    let newStatus = order.status
    
    switch (event) {
      case 'transaction.updated':
        if (transaction.status === 'APPROVED') {
          newStatus = 'paid'
        } else if (transaction.status === 'DECLINED' || transaction.status === 'ERROR' || transaction.status === 'VOIDED') {
          newStatus = 'cancelled'
        }
        break
    }

    // Update order
    if (newStatus !== order.status) {
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          status: newStatus,
          wompi_transaction_id: transaction.id,
          payment_reference: transaction.payment_method?.extra?.external_identifier || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)

      if (updateError) {
        console.error('[wompi-webhook] Order update error:', updateError)
        return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
      }

      console.log(`[wompi-webhook] Order ${order.order_number} updated to ${newStatus}`)

      // Decrement stock only when payment is approved
      if (newStatus === 'paid') {
        const orderItems = order.items || []
        console.log(`[wompi-webhook] Decrementing stock for ${orderItems.length} items of order ${order.order_number}`)
        for (const item of orderItems) {
          if (item.product_id) {
            try {
              await supabaseAdmin.rpc('decrement_size_stock', { 
                p_product_id: item.product_id, 
                p_size: item.size || '',
                p_quantity: item.quantity 
              })
              console.log(`[wompi-webhook] Stock decremented for product ${item.product_id}, size ${item.size}, quantity ${item.quantity}`)
            } catch (err) {
              console.error('[wompi-webhook] Error decrementing size stock via RPC:', err)
              // Fallback to old RPC
              try {
                await supabaseAdmin.rpc('decrement_stock', { 
                  product_id: item.product_id, 
                  quantity: item.quantity 
                })
              } catch (err2) {
                console.error('[wompi-webhook] Fallback RPC decrement_stock also failed:', err2)
                // Manual fallback
                try {
                  const { data: pData } = await supabaseAdmin
                    .from('products')
                    .select('stock')
                    .eq('id', item.product_id)
                    .single()
                  if (pData) {
                    await supabaseAdmin
                      .from('products')
                      .update({ stock: Math.max(0, pData.stock - item.quantity) })
                      .eq('id', item.product_id)
                  }
                } catch (err3) {
                  console.error('[wompi-webhook] Manual stock update failed:', err3)
                }
              }
            }
          }
        }
      }

      // Create notification for customer
      if (order.user_id) {
        const title = newStatus === 'paid' ? '💰 Pago Confirmado' : '❌ Pago Cancelado/Rechazado'
        const message = newStatus === 'paid'
          ? `¡Tu pago para el pedido #${order.order_number} fue aprobado con éxito! Estamos preparando tu envío.`
          : `El pago para tu pedido #${order.order_number} fue declinado o cancelado.`

        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: order.user_id,
            order_id: order.id,
            title,
            message,
            type: 'order_update',
          })
      }

      // Send email notification to customer
      const customerEmail = order.shipping_address?.email || order.guest_email
      if (customerEmail) {
        sendOrderStatusEmail(
          customerEmail,
          order.order_number,
          newStatus,
          {
            adminNote: newStatus === 'paid' ? 'Pago aprobado por Wompi.' : 'Transacción de pago rechazada o cancelada en Wompi.',
          },
          {
            subtotal: order.subtotal,
            shipping_cost: order.shipping_cost,
            total: order.total,
            items: order.items,
          }
        ).catch((err) => console.error('[wompi-webhook] Async email error:', err))
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[wompi-webhook] Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Wompi sends webhooks as POST
export async function GET() {
  return NextResponse.json({ status: 'Wompi webhook endpoint active' })
}
