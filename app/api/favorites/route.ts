import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ items: [] })
    }

    const { data: dbFavs, error } = await supabase
      .from('favorites')
      .select('product:products(*)')
      .eq('user_id', user.id)

    if (error) {
      console.warn('[favorites GET] Error:', error.message)
      return NextResponse.json({ items: [] })
    }

    const items = (dbFavs ?? [])
      .filter((f: any) => f.product)
      .map((f: any) => ({
        id: f.product.id,
        name: f.product.name,
        slug: f.product.slug,
        description: f.product.description,
        price: f.product.price,
        original_price: f.product.original_price,
        images: f.product.images || [],
        category: f.product.category || 'Premium',
        colors: f.product.colors || [],
        sizes: f.product.sizes || [],
        stock: f.product.stock || 0,
        featured: f.product.featured || false,
      }))

    return NextResponse.json({ items, userId: user.id })
  } catch (err) {
    console.error('[favorites GET]', err)
    return NextResponse.json({ items: [] })
  }
}
