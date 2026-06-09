import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { generateWompiSignature } from '@/lib/wompi'

export async function POST(request: Request) {
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[orders] Missing Supabase environment variables')
      return NextResponse.json({ error: 'Configuración del servidor incompleta' }, { status: 500 })
    }

    const body = await request.json()
    const {
      items,
      shippingInfo,
      shippingCost,
      paymentMethod,
    } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No hay productos en la orden' }, { status: 400 })
    }

    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()

    // Get current user if logged in
    const { data: { user } } = await supabase.auth.getUser()

    // Calculate totals
    const subtotal = items.reduce((acc: number, item: { price: number; quantity: number }) => 
      acc + item.price * item.quantity, 0)

    const total = subtotal + (shippingCost || 0)

    // Generate order number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const randomStr = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    const orderNumber = `LH-${dateStr}-${randomStr}`

    // Create order in database
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user?.id || null,
        status: 'pending',
        subtotal,
        shipping_cost: shippingCost || 0,
        total,
        shipping_method: body.shippingMethod || 'standard',
        shipping_address: {
          name: shippingInfo.name,
          phone: shippingInfo.phone,
          email: shippingInfo.email,
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          postal_code: shippingInfo.postalCode || '',
          country: 'Colombia'
        },
        payment_method: paymentMethod || 'wompi',
        notes: shippingInfo.notes || '',
      })
      .select()
      .single()

    if (orderError) {
      console.error('[orders] Order creation error:', JSON.stringify(orderError))
      return NextResponse.json({ error: 'Error al crear la orden: ' + orderError.message }, { status: 500 })
    }

    // Create order items (non-fatal if table doesn't exist yet)
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
      product_id: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.productId) ? item.productId : null,
      product_name: item.productName,
      product_image: item.productImage || '',
      price: item.price,
      quantity: item.quantity,
      color: item.color || '',
      size: item.size || '',
    }))

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      // Log but don't fail — order is already created
      console.warn('[orders] Order items insert warning (table may not exist):', itemsError.message)
    }

    // Update product stock
    for (const item of items) {
      try {
        await supabaseAdmin.rpc('decrement_stock', { 
          product_id: item.productId, 
          quantity: item.quantity 
        })
      } catch {
        // If RPC doesn't exist, do it manually
        await supabaseAdmin
          .from('products')
          .select('stock')
          .eq('id', item.productId)
          .single()
          .then(async ({ data }) => {
            if (data) {
              await supabaseAdmin
                .from('products')
                .update({ stock: Math.max(0, data.stock - item.quantity) })
                .eq('id', item.productId)
            }
          })
      }
    }

    // Generate Wompi checkout URL
    const wompiPublicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || 'pub_test_XXXXXXXXXXXXXXXXXX'
    const amountInCents = Math.round(total * 100)
    const reference = order.id
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxurycapsoficial.vercel.app'
    const redirectUrl = encodeURIComponent(`${siteUrl}/checkout/confirmacion?ref=${order.id}`)

    // Verify integrity key is available
    if (!process.env.WOMPI_INTEGRITY_KEY) {
      console.error('[orders] WOMPI_INTEGRITY_KEY is not set — signature will be empty and Wompi will reject the request')
    } else {
      console.log('[orders] WOMPI_INTEGRITY_KEY is present, length:', process.env.WOMPI_INTEGRITY_KEY.length)
    }

    const signature = generateWompiSignature(reference, amountInCents, 'COP')

    const checkoutUrl = `https://checkout.wompi.co/p/?public-key=${wompiPublicKey}&currency=COP&amount-in-cents=${amountInCents}&reference=${reference}&signature:integrity=${signature}&redirect-url=${redirectUrl}&customer-data:email=${encodeURIComponent(shippingInfo.email || '')}&customer-data:full-name=${encodeURIComponent(shippingInfo.name || '')}&customer-data:phone-number=${encodeURIComponent(shippingInfo.phone || '')}`

    console.log('[orders] Checkout URL generated, reference:', reference, '| signature length:', signature.length, '| amount:', amountInCents)

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
          .maybeSingle()

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
