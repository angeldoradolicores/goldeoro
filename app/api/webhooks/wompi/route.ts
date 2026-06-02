import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/wompi'

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-wompi-signature')
    const timestamp = request.headers.get('x-wompi-timestamp')
    const payload = await request.text()

    // Verify webhook signature
    if (signature && timestamp) {
      const isValid = verifyWebhookSignature(payload, signature, timestamp)
      if (!isValid) {
        console.error('[v0] Invalid webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const data = JSON.parse(payload)
    const event = data.event
    const transaction = data.data?.transaction

    if (!transaction) {
      return NextResponse.json({ error: 'No transaction data' }, { status: 400 })
    }

    const supabase = await createClient()

    // Find order by reference
    const { data: order, error: findError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', transaction.reference)
      .single()

    if (findError || !order) {
      console.error('[v0] Order not found for reference:', transaction.reference)
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
      case 'nequi_token.updated':
        // Handle Nequi token updates if needed
        break
    }

    // Update order
    if (newStatus !== order.status) {
      await supabase
        .from('orders')
        .update({
          status: newStatus,
          wompi_transaction_id: transaction.id,
          payment_reference: transaction.payment_method?.extra?.external_identifier || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)

      console.log(`[v0] Order ${order.order_number} updated to ${newStatus}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[v0] Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Wompi sends webhooks as POST
export async function GET() {
  return NextResponse.json({ status: 'Wompi webhook endpoint active' })
}
