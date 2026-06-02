import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      items,
      shippingInfo,
      shippingCost,
      paymentMethod,
    } = body

    const supabase = await createClient()

    // Get current user if logged in
    const { data: { user } } = await supabase.auth.getUser()

    // Calculate totals
    const subtotal = items.reduce((acc: number, item: { price: number; quantity: number }) => 
      acc + item.price * item.quantity, 0)

    const total = subtotal + (shippingCost || 0)

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id || null,
        status: 'pending',
        subtotal,
        shipping_cost: shippingCost || 0,
        total,
        payment_method: paymentMethod || 'wompi',
        shipping_name: shippingInfo.name,
        shipping_phone: shippingInfo.phone,
        shipping_email: shippingInfo.email,
        shipping_address: shippingInfo.address,
        shipping_city: shippingInfo.city,
        shipping_state: shippingInfo.state,
        shipping_postal_code: shippingInfo.postalCode || '',
        shipping_country: 'Colombia',
        notes: shippingInfo.notes || '',
      })
      .select()
      .single()

    if (orderError) {
      console.error('[v0] Order creation error:', orderError)
      return NextResponse.json({ error: 'Error al crear la orden' }, { status: 500 })
    }

    // Create order items
    const orderItems = items.map((item: {
      productId: string
      productName: string
      productImage: string
      price: number
      quantity: number
      color?: string
      size?: string
    }) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      product_image: item.productImage || '',
      price: item.price,
      quantity: item.quantity,
      color: item.color || '',
      size: item.size || '',
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('[v0] Order items error:', itemsError)
      // Rollback order
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ error: 'Error al crear los items de la orden' }, { status: 500 })
    }

    // Update product stock
    for (const item of items) {
      await supabase.rpc('decrement_stock', { 
        product_id: item.productId, 
        quantity: item.quantity 
      }).catch(() => {
        // If RPC doesn't exist, do it manually
        supabase
          .from('products')
          .update({ stock: supabase.rpc('greatest', { a: 0, b: `stock - ${item.quantity}` }) })
          .eq('id', item.productId)
      })
    }

    // Generate Wompi checkout URL
    const wompiPublicKey = process.env.WOMPI_PUBLIC_KEY || 'pub_test_XXXXXXXXXXXXXXXXXX'
    const amountInCents = total * 100
    const reference = order.id
    const redirectUrl = encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/confirmacion?ref=${order.id}`)

    const checkoutUrl = `https://checkout.wompi.co/p/?public-key=${wompiPublicKey}&currency=COP&amount-in-cents=${amountInCents}&reference=${reference}&redirect-url=${redirectUrl}&customer-data:email=${shippingInfo.email}&customer-data:full-name=${encodeURIComponent(shippingInfo.name)}&customer-data:phone-number=${shippingInfo.phone}`

    return NextResponse.json({
      success: true,
      orderId: order.id,
      total,
      checkoutUrl,
    })
  } catch (error) {
    console.error('[v0] Order API error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('id')
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (orderId) {
      // Get specific order
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', orderId)
        .single()

      if (error) {
        return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
      }

      // Check if user owns this order or is admin
      if (order.user_id !== user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user?.id || '')
          .single()

        if (!profile?.is_admin) {
          return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
        }
      }

      return NextResponse.json(order)
    }

    // Get user's orders
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(orders || [])
  } catch (error) {
    console.error('[v0] Orders GET error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
