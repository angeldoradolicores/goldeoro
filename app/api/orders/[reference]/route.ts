import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { getTransaction } from '@/lib/wompi'
import { sendOrderStatusEmail } from '@/lib/mail'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params
    const { searchParams } = new URL(request.url)
    const wompiIdParam = searchParams.get('wompi_id')?.trim()

    const supabaseAdmin = createAdminClient()

    // Get order by reference — try UUID first, then fall back to order_number
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reference)
    
    const query = supabaseAdmin
      .from('orders')
      .select(`*, items:order_items(*)`)
    
    const { data: order, error } = isUUID
      ? await query.eq('id', reference).maybeSingle()
      : await query.eq('order_number', reference).maybeSingle()

    if (error || !order) {
      console.error('[orders/reference] Not found:', reference, error?.message)
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    const wompiId = wompiIdParam || order.wompi_transaction_id

    // If there's a Wompi transaction ID, check/update its status
    if (wompiId) {
      try {
        const transaction = await getTransaction(wompiId)
        let newStatus = order.status

        if (transaction.status === 'APPROVED') {
          newStatus = 'paid'
        } else if (transaction.status === 'DECLINED' || transaction.status === 'ERROR' || transaction.status === 'VOIDED') {
          newStatus = 'cancelled'
        }

        // Update database if status changed
        if (newStatus !== order.status) {
          const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update({
              status: newStatus,
              wompi_transaction_id: wompiId,
              payment_reference: transaction.payment_method?.extra?.external_identifier || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', order.id)

          if (!updateError) {
            order.status = newStatus
            order.wompi_transaction_id = wompiId

            console.log(`[orders/reference] Order ${order.order_number} status updated to ${newStatus} via Wompi check`)

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
              ).catch((err) => console.error('[orders/reference-email] Async email error:', err))
            }
          } else {
            console.error('[orders/reference] Order update error:', updateError)
          }
        }

        return NextResponse.json({
          ...order,
          transactionStatus: transaction.status,
          transactionMessage: transaction.status_message,
        })
      } catch (err) {
        console.error('[orders/reference] Failed to check transaction status:', err)
      }
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('[orders/reference] Order status API error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
