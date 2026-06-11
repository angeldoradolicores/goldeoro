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
      .select('*')
      .gt('stock', 0)
      .order('created_at', { ascending: false })

    // Apply filters
    if (category && category !== 'Todos' && category !== 'all') {
      // Accept either a category UUID (category_id) or a category slug/name.
      const uuidRegex = /^[0-9a-fA-F-]{36}$/
      if (uuidRegex.test(category)) {
        query = query.eq('category_id', category)
      } else {
        // Try to resolve slug first, then name (case-insensitive)
        const { data: catBySlug } = await supabase.from('categories').select('id').eq('slug', category).limit(1)
        if (catBySlug && catBySlug.length > 0) {
          query = query.eq('category_id', catBySlug[0].id)
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
      query = query.limit(parseInt(limit))
    }

    const { data: products, error } = await query

    if (error) {
      console.error('[v0] Products fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(products || [])
  } catch (error) {
    console.error('[v0] Products API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
