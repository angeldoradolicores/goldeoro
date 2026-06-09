import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// One-time migration route to add missing columns to products table
// Only callable by admin users
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('is_admin').eq('id', user.id).maybeSingle()

    if (!profile?.is_admin) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })

    const admin = createAdminClient()
    const results: Record<string, string> = {}

    // Try inserting a product with images/videos to detect if columns exist
    // We use a probe approach: try to select images column
    const { error: probeError } = await admin
      .from('products')
      .select('images, videos, category')
      .limit(1)

    if (!probeError) {
      results.columns = 'images, videos, category columns already exist ✓'
      return NextResponse.json({ success: true, results })
    }

    // Columns don't exist - we need raw SQL
    // Use Supabase Management API with service role
    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)\./)?.[1]
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!projectRef || !serviceKey) {
      return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
    }

    const queries = [
      `ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}'`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS videos TEXT[] DEFAULT '{}'`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Premium'`,
    ]

    for (const sql of queries) {
      try {
        const res = await fetch(
          `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${serviceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: sql }),
          }
        )
        const json = await res.json()
        results[sql.slice(0, 40)] = res.ok ? '✓ OK' : `✗ ${JSON.stringify(json)}`
      } catch (e) {
        results[sql.slice(0, 40)] = `✗ fetch error: ${e}`
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
