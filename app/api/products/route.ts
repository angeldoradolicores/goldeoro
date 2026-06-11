import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const promotion = searchParams.get('promotion')
    const search = searchParams.get('search')
    const limit = searchParams.get('limit')

    const supabase = await createClient()

    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        price,
        original_price,
        stock,
        featured,
        is_promotion,
        colors,
        sizes,
        created_at,
        product_images(url, is_primary, sort_order),
        category:categories(name, slug)
      `)
      .gt('stock', 0)
      .order('created_at', { ascending: false })

    // Apply filters
    if (category && category !== 'Todos' && category !== 'all') {
      // Accept either a category UUID (category_id) or a category slug/name.
      // Use a stricter UUID regex to detect real UUIDs.
      const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
      if (uuidRegex.test(category)) {
        query = query.eq('category_id', category)
      } else {
        // Try to resolve slug (case-insensitive) first, then name (case-insensitive)
        const { data: catBySlugExact } = await supabase.from('categories').select('id').eq('slug', category).limit(1)
        if (catBySlugExact && catBySlugExact.length > 0) {
          query = query.eq('category_id', catBySlugExact[0].id)
        } else {
          const { data: catBySlugCI } = await supabase.from('categories').select('id').ilike('slug', category).limit(1)
          if (catBySlugCI && catBySlugCI.length > 0) {
            query = query.eq('category_id', catBySlugCI[0].id)
          } else {
            const { data: catByName } = await supabase.from('categories').select('id').ilike('name', category).limit(1)
            if (catByName && catByName.length > 0) {
              query = query.eq('category_id', catByName[0].id)
            } else {
              // No matching category -> return empty set
              return NextResponse.json([])
            }
          }
        }
      }
    }

    if (featured === 'true') {
      query = query.eq('featured', true)
    }

    if (promotion === 'true') {
      query = query.eq('is_promotion', true)
    }

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    if (limit) {
      const requestedLimit = Number.parseInt(limit, 10)
      const capLimit = Number.isFinite(requestedLimit) ? Math.min(requestedLimit, 100) : undefined
      if (capLimit) {
        query = query.limit(capLimit)
      }
    }

    const { data: products, error } = await query

    if (error) {
      console.error('[v0] Products fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const transformedProducts = (products || []).map((p: any) => {
      const sortedImages = (p.product_images || [])
        .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((img: any) => img.url)

      return {
        ...p,
        images: sortedImages.length > 0 ? sortedImages : ['/images/placeholder-hat.jpg'],
        category: p.category?.name || 'Premium',
        category_slug: p.category?.slug || '',
      }
    })

    return NextResponse.json(transformedProducts, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('[v0] Products API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
