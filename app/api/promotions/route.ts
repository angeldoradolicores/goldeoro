import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: promotions, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('active', true)
      .gte('end_date', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[v0] Promotions fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(promotions)
  } catch (error) {
    console.error('[v0] Promotions API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    const supabase = await createClient()

    const { data: promotion, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .single()

    if (error || !promotion) {
      return NextResponse.json({ error: 'Codigo no valido' }, { status: 404 })
    }

    // Check if promotion has expired
    if (promotion.end_date && new Date(promotion.end_date) < new Date()) {
      return NextResponse.json({ error: 'Este codigo ha expirado' }, { status: 400 })
    }

    // Check max uses
    if (promotion.max_uses && promotion.used_count >= promotion.max_uses) {
      return NextResponse.json({ error: 'Este codigo ya no esta disponible' }, { status: 400 })
    }

    return NextResponse.json(promotion)
  } catch (error) {
    console.error('[v0] Promotion validation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
