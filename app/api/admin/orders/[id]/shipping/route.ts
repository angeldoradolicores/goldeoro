import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { sendOrderStatusEmail } from '@/lib/mail'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params
    const body = await request.json()
    const { status, tracking_number, carrier, tracking_photo_url, admin_note } = body

    if (!orderId) {
      return NextResponse.json({ error: 'ID de orden requerido' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()

    // Build update object
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (status) updateData.status = status
    if (tracking_number !== undefined) updateData.tracking_number = tracking_number
    if (carrier !== undefined) updateData.carrier = carrier
    if (tracking_photo_url !== undefined) updateData.tracking_photo_url = tracking_photo_url
    if (admin_note !== undefined) updateData.admin_note = admin_note
    if (status === 'shipped') updateData.shipped_at = new Date().toISOString()
    if (status === 'delivered') updateData.delivered_at = new Date().toISOString()

    // Update the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select('*, items:order_items(*)')
      .single()

    if (orderError || !order) {
      console.error('[shipping] Order update error:', orderError)
      return NextResponse.json({ error: 'Error al actualizar la orden' }, { status: 500 })
    }

    // Create notification for the customer if they have a user_id
    if (order.user_id && status) {
      const notificationMap: Record<string, { title: string; message: string; type: string }> = {
        processing: {
          title: '🛍️ Tu pedido está siendo preparado',
          message: `Tu pedido #${order.order_number} está siendo procesado. Te notificaremos cuando sea enviado.`,
          type: 'order_update',
        },
        shipped: {
          title: '🚚 ¡Tu pedido fue enviado!',
          message: `Tu pedido #${order.order_number} ya está en camino${carrier ? ` con ${carrier}` : ''}${tracking_number ? `. Número de guía: ${tracking_number}` : ''}.${admin_note ? ` Nota: ${admin_note}` : ''}`,
          type: 'shipped',
        },
        delivered: {
          title: '✅ ¡Tu pedido fue entregado!',
          message: `Tu pedido #${order.order_number} ha sido entregado. ¡Gracias por tu compra en Urban Crown!`,
          type: 'delivered',
        },
        cancelled: {
          title: '❌ Tu pedido fue cancelado',
          message: `Tu pedido #${order.order_number} ha sido cancelado.${admin_note ? ` Razón: ${admin_note}` : ' Si tienes dudas, contáctanos.'}`,
          type: 'order_update',
        },
      }

      const notification = notificationMap[status]
      if (notification) {
        const { error: notifError } = await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: order.user_id,
            order_id: orderId,
            title: notification.title,
            message: notification.message,
            type: notification.type,
          })

        if (notifError) {
          console.warn('[shipping] Notification insert warning:', notifError.message)
        }
      }
    }

    // Send email notification to customer
    const customerEmail = order.shipping_address?.email || order.guest_email
    if (customerEmail && status) {
      // Async send email so it doesn't block the API response
      sendOrderStatusEmail(
        customerEmail,
        order.order_number,
        status,
        {
          carrier: order.carrier,
          trackingNumber: order.tracking_number,
          trackingPhotoUrl: order.tracking_photo_url,
          adminNote: order.admin_note,
        },
        {
          subtotal: order.subtotal,
          shipping_cost: order.shipping_cost,
          total: order.total,
          items: order.items,
        }
      ).catch((err) => console.error('[shipping-api] Async email error:', err))
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('[shipping] API error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
