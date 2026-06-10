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
