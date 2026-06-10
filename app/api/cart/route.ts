import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ items: [] })
    }

    const { data: dbItems, error } = await supabase
      .from('cart_items')
      .select(`
        quantity,
        selected_color,
        selected_size,
        product:products(*)
      `)
      .eq('user_id', user.id)

    if (error) {
      console.warn('[cart GET] Error:', error.message)
      return NextResponse.json({ items: [] })
    }

    const items = (dbItems ?? [])
      .filter((item: any) => item.product)
      .map((item: any) => ({
        id: `${item.product.id}::${item.selected_color || 'default'}::${item.selected_size || 'default'}`,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          description: item.product.description,
          price: item.product.price,
          original_price: item.product.original_price,
          images: item.product.images || [],
          category: item.product.category || 'Premium',
          colors: item.product.colors || [],
          sizes: item.product.sizes || [],
          stock: item.product.stock || 0,
          featured: item.product.featured || false,
        },
        quantity: item.quantity,
        selectedColor: item.selected_color,
        selectedSize: item.selected_size,
      }))

    return NextResponse.json({ items, userId: user.id })
  } catch (err) {
    console.error('[cart GET]', err)
    return NextResponse.json({ items: [] })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { product_id, quantity, selected_color, selected_size } = body

    if (!product_id || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { error } = await supabase
      .from('cart_items')
      .upsert({
        user_id: user.id,
        product_id,
        quantity,
        selected_color: selected_color || null,
        selected_size: selected_size || null,
      }, {
        onConflict: 'user_id,product_id,selected_color,selected_size',
      })

    if (error) {
      console.error('[cart POST] Error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[cart POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { product_id, selected_color, selected_size } = body

    if (!product_id) {
      return NextResponse.json({ error: 'Missing product_id' }, { status: 400 })
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .eq('selected_color', selected_color || null)
      .eq('selected_size', selected_size || null)

    if (error) {
      console.error('[cart DELETE] Error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[cart DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
