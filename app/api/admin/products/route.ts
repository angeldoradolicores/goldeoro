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

async function generateUniqueSlug(supabase: Awaited<ReturnType<typeof createClient>>, name: string, excludeId?: string) {
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

async function ensureAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
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
      .select(`
        *,
        product_images(url, is_primary, sort_order),
        category:categories(name, slug)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[v0] Products fetch error:', error)
      return NextResponse.json({ error: error.message, products: [] }, { status: 500 })
    }

    const transformedProducts = (products || []).map((p: any) => {
      const sortedImages = (p.product_images || [])
        .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((img: any) => img.url)

      return {
        ...p,
        images: sortedImages.length > 0 ? sortedImages : [],
        category: p.category?.name || 'Premium',
        category_slug: p.category?.slug || '',
      }
    })

    return NextResponse.json({ products: transformedProducts })
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

    // Resolve category_id
    let categoryId = null
    const reqCategory = body.category_id || body.category
    if (reqCategory && reqCategory !== 'Todos') {
      const uuidRegex = /^[0-9a-fA-F-]{36}$/
      if (uuidRegex.test(reqCategory)) {
        categoryId = reqCategory
      } else {
        // Try slug first
        const { data: catBySlug } = await supabase.from('categories').select('id').eq('slug', reqCategory.toLowerCase()).limit(1)
        if (catBySlug && catBySlug.length > 0) {
          categoryId = catBySlug[0].id
        } else {
          // Try name
          const { data: catByName } = await supabase.from('categories').select('id').ilike('name', reqCategory).limit(1)
          if (catByName && catByName.length > 0) {
            categoryId = catByName[0].id
          }
        }
      }
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name: body.name,
        slug,
        description: body.description || '',
        price: body.price || 0,
        original_price: body.original_price || null,
        category_id: categoryId,
        stock: body.stock || 0,
        featured: body.featured || false,
        is_promotion: body.is_promotion || false,
        colors: body.colors || ['Negro'],
        sizes: body.sizes || ['M'],
        sizes_stock: body.sizes_stock || null,
        product_type: body.product_type || 'gorra',
        team: body.team || null,
        season: body.season || null,
        player: body.player || null,
        jersey_type: body.jersey_type || null,
        collection_type: body.collection_type || null,
        edition: body.edition || null,
        year: body.year || null,
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Product creation error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Insert images if provided
    if (body.images && Array.isArray(body.images) && body.images.length > 0) {
      const imageInserts = body.images.map((url: string, index: number) => ({
        product_id: product.id,
        url,
        is_primary: index === 0,
        sort_order: index,
      }))
      const { error: imgError } = await supabase.from('product_images').insert(imageInserts)
      if (imgError) {
        console.error('[v0] Product images insertion error:', imgError)
      }
    }

    // Insert videos if provided
    if (body.videos && Array.isArray(body.videos) && body.videos.length > 0) {
      const videoInserts = body.videos.map((url: string) => ({
        product_id: product.id,
        url,
      }))
      const { error: vidError } = await supabase.from('product_videos').insert(videoInserts)
      if (vidError) {
        console.error('[v0] Product videos insertion error:', vidError)
      }
    }

    // Get final product with resolved relations for client state sync
    const { data: finalProduct } = await supabase
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
      .eq('id', product.id)
      .maybeSingle()

    let transformedProduct = product
    if (finalProduct) {
      const sortedImages = (finalProduct.product_images || [])
        .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((img: any) => img.url)

      transformedProduct = {
        ...finalProduct,
        images: sortedImages.length > 0 ? sortedImages : [],
        category: finalProduct.category?.name || 'Premium',
        product_type: finalProduct.product_type,
        team: finalProduct.team,
        season: finalProduct.season,
        player: finalProduct.player,
        jersey_type: finalProduct.jersey_type,
        collection_type: finalProduct.collection_type,
        edition: finalProduct.edition,
        year: finalProduct.year,
      }
    }

    return NextResponse.json({ product: transformedProduct }, { status: 201 })
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

    // Resolve category_id
    let categoryId = null
    const reqCategory = body.category_id || body.category
    if (reqCategory && reqCategory !== 'Todos') {
      const uuidRegex = /^[0-9a-fA-F-]{36}$/
      if (uuidRegex.test(reqCategory)) {
        categoryId = reqCategory
      } else {
        // Try slug first
        const { data: catBySlug } = await supabase.from('categories').select('id').eq('slug', reqCategory.toLowerCase()).limit(1)
        if (catBySlug && catBySlug.length > 0) {
          categoryId = catBySlug[0].id
        } else {
          // Try name
          const { data: catByName } = await supabase.from('categories').select('id').ilike('name', reqCategory).limit(1)
          if (catByName && catByName.length > 0) {
            categoryId = catByName[0].id
          }
        }
      }
    }

    const { data: product, error } = await supabase
      .from('products')
      .update({
        name: body.name,
        slug,
        description: body.description,
        price: body.price,
        original_price: body.original_price || null,
        category_id: categoryId,
        stock: body.stock,
        featured: body.featured || false,
        is_promotion: body.is_promotion || false,
        colors: body.colors || ['Negro'],
        sizes: body.sizes || ['M'],
        sizes_stock: body.sizes_stock || null,
        product_type: body.product_type || 'gorra',
        team: body.team || null,
        season: body.season || null,
        player: body.player || null,
        jersey_type: body.jersey_type || null,
        collection_type: body.collection_type || null,
        edition: body.edition || null,
        year: body.year || null,
      })
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      console.error('[v0] Product update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update images if provided
    if (body.images && Array.isArray(body.images)) {
      await supabase.from('product_images').delete().eq('product_id', body.id)
      if (body.images.length > 0) {
        const imageInserts = body.images.map((url: string, index: number) => ({
          product_id: body.id,
          url,
          is_primary: index === 0,
          sort_order: index,
        }))
        const { error: imgError } = await supabase.from('product_images').insert(imageInserts)
        if (imgError) {
          console.error('[v0] Product images update insertion error:', imgError)
        }
      }
    }

    // Update videos if provided
    if (body.videos && Array.isArray(body.videos)) {
      await supabase.from('product_videos').delete().eq('product_id', body.id)
      if (body.videos.length > 0) {
        const videoInserts = body.videos.map((url: string) => ({
          product_id: body.id,
          url,
        }))
        const { error: vidError } = await supabase.from('product_videos').insert(videoInserts)
        if (vidError) {
          console.error('[v0] Product videos update insertion error:', vidError)
        }
      }
    }

    // Get final product with resolved relations for client state sync
    const { data: finalProduct } = await supabase
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
      .eq('id', product.id)
      .maybeSingle()

    let transformedProduct = product
    if (finalProduct) {
      const sortedImages = (finalProduct.product_images || [])
        .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((img: any) => img.url)

      transformedProduct = {
        ...finalProduct,
        images: sortedImages.length > 0 ? sortedImages : [],
        category: finalProduct.category?.name || 'Premium',
        product_type: finalProduct.product_type,
        team: finalProduct.team,
        season: finalProduct.season,
        player: finalProduct.player,
        jersey_type: finalProduct.jersey_type,
        collection_type: finalProduct.collection_type,
        edition: finalProduct.edition,
        year: finalProduct.year,
      }
    }

    return NextResponse.json({ product: transformedProduct })
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
