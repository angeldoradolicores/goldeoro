import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    let product = null

    if (UUID_REGEX.test(slug)) {
      // It's a UUID — fetch by id
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_type,
          team,
          season,
          player,
          jersey_type,
          collection_type,
          edition,
          year,
          product_images(url, is_primary, sort_order),
          category:categories(name, slug)
        `)
        .eq('id', slug)
        .maybeSingle()

      if (error) {
        console.error('[products/slug] ID fetch error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      product = data
    }

    if (!product) {
      // Try by slug
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_type,
          team,
          season,
          player,
          jersey_type,
          collection_type,
          edition,
          year,
          product_images(url, is_primary, sort_order),
          category:categories(name, slug)
        `)
        .eq('slug', slug)
        .maybeSingle()

      if (error) {
        console.error('[products/slug] Slug fetch error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      product = data
    }

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // Transform product fields to match client-side type
    const sortedImages = (product.product_images || [])
      .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((img: any) => img.url)

    const transformedProduct = {
      ...product,
      images: sortedImages.length > 0 ? sortedImages : ['/images/placeholder-hat.jpg'],
      category: product.category?.name || 'Premium',
      product_type: product.product_type,
      team: product.team,
      season: product.season,
      player: product.player,
      jersey_type: product.jersey_type,
      collection_type: product.collection_type,
      edition: product.edition,
      year: product.year,
    }

    return NextResponse.json({ product: transformedProduct })
  } catch (error) {
    console.error('[products/slug] Server error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
