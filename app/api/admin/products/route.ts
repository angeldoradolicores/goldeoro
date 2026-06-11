import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function normalizeSlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function generateUniqueSlug(supabase: ReturnType<typeof createClient>, name: string, excludeId?: string) {
  const baseSlug = normalizeSlug(name || 'producto')
  let query = supabase
    .from('products')
    .select('slug')
    .ilike('slug', `${baseSlug}%`)

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data: existing, error } = await query
  if (error) {
    throw error
  }

  const slugs = (existing || []).map((item: any) => item.slug)
  if (!slugs.includes(baseSlug)) {
    return baseSlug
  }

  let suffix = 1
  while (slugs.includes(`${baseSlug}-${suffix}`)) {
    suffix += 1
  }

  return `${baseSlug}-${suffix}`
}

async function ensureAdmin(supabase: ReturnType<typeof createClient>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  return null
}

// GET - List products for admin
export async function GET() {
  try {
    const supabase = await createClient()
    const adminError = await ensureAdmin(supabase)
    if (adminError) return adminError

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[v0] Products fetch error:', error)
      return NextResponse.json({ error: error.message, products: [] }, { status: 500 })
    }

    return NextResponse.json({ products: products || [] })
  } catch (error) {
    console.error('[v0] Admin products error:', error)
    return NextResponse.json({ error: 'Internal server error', products: [] }, { status: 500 })
  }
}

// POST - Create new product
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    if (!body.name) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
    }

    const slug = await generateUniqueSlug(supabase, body.name)

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name: body.name,
        slug,
        description: body.description || '',
        price: body.price || 0,
        original_price: body.original_price || null,
        category: body.category || 'Urban',
        stock: body.stock || 0,
        featured: body.featured || false,
        is_promotion: body.is_promotion || false,
        images: body.images || [],
        videos: body.videos || [],
        colors: body.colors || ['Negro'],
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Product creation error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('[v0] Admin create product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update product
export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()

    if (!body.id || !body.name) {
      return NextResponse.json({ error: 'ID y nombre requeridos' }, { status: 400 })
    }

    const slug = await generateUniqueSlug(supabase, body.name, body.id)

    const { data: product, error } = await supabase
      .from('products')
      .update({
        name: body.name,
        slug,
        description: body.description,
        price: body.price,
        original_price: body.original_price || null,
        category: body.category,
        stock: body.stock,
        featured: body.featured || false,
        is_promotion: body.is_promotion || false,
        images: body.images || [],
        videos: body.videos || [],
        colors: body.colors || ['Negro'],
      })
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      console.error('[v0] Product update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('[v0] Admin update product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete product
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', body.id)

    if (error) {
      console.error('[v0] Product delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Admin delete product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
