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
        .select('*')
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
        .select('*')
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

    return NextResponse.json({ product })
  } catch (error) {
    console.error('[products/slug] Server error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
