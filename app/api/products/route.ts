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
      query = query.eq('category', category)
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
