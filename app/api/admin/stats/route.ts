import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
    if (!profile?.is_admin) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })

    const now = new Date()
    const startOfMonth    = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0)

    // ── Ventas reales ──────────────────────────────────────────────────────
    const paidStatuses = ['paid', 'processing', 'shipped', 'delivered']

    // All-time total revenue
    const { data: allOrders } = await supabase
      .from('orders').select('total, status, created_at')
      .in('status', paidStatuses)

    const totalRevenue = allOrders?.reduce((a, o) => a + (o.total || 0), 0) || 0

    // This month
    const { data: monthSales } = await supabase
      .from('orders').select('total')
      .in('status', paidStatuses)
      .gte('created_at', startOfMonth.toISOString())

    // Last month
    const { data: lastMonthSales } = await supabase
      .from('orders').select('total')
      .in('status', paidStatuses)
      .gte('created_at', startOfLastMonth.toISOString())
      .lte('created_at', endOfLastMonth.toISOString())

    // ── Pedidos ────────────────────────────────────────────────────────────
    const { count: ordersThisMonth } = await supabase
      .from('orders').select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())

    const { count: ordersLastMonth } = await supabase
      .from('orders').select('*', { count: 'exact', head: true })
      .gte('created_at', startOfLastMonth.toISOString())
      .lte('created_at', endOfLastMonth.toISOString())

    const { count: totalOrders } = await supabase
      .from('orders').select('*', { count: 'exact', head: true })

    // ── Productos ──────────────────────────────────────────────────────────
    const { count: totalProducts } = await supabase
      .from('products').select('*', { count: 'exact', head: true })

    // ── Clientes ───────────────────────────────────────────────────────────
    const { count: totalCustomers } = await supabase
      .from('profiles').select('*', { count: 'exact', head: true })

    const { count: newCustomers } = await supabase
      .from('profiles').select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())

    // ── Pedidos recientes ──────────────────────────────────────────────────
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('id, order_number, total, status, created_at, shipping_address')
      .order('created_at', { ascending: false })
      .limit(8)

    const formattedOrders = recentOrders?.map(o => ({
      id: o.id,
      reference: o.order_number,
      customer_name: (o.shipping_address as any)?.name || 'Cliente',
      total: o.total,
      status: o.status,
    })) || []

    // ── Top productos por cantidad vendida (order_items) ───────────────────
    const { data: soldItems } = await supabase
      .from('order_items')
      .select('product_name, price, quantity')

    const productSales = new Map<string, { name: string; total_sold: number; revenue: number; price: number }>()
    soldItems?.forEach(item => {
      const key = item.product_name
      const existing = productSales.get(key) || { name: item.product_name, total_sold: 0, revenue: 0, price: item.price }
      existing.total_sold += item.quantity
      existing.revenue += item.price * item.quantity
      productSales.set(key, existing)
    })

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, 6)
      .map(p => ({ ...p, category: '' }))

    // ── Ventas por día (últimos 30 días) ───────────────────────────────────
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const { data: recentSalesData } = await supabase
      .from('orders')
      .select('total, created_at')
      .in('status', paidStatuses)
      .gte('created_at', thirtyDaysAgo.toISOString())

    // Group by day
    const dailyMap = new Map<string, number>()
    recentSalesData?.forEach(o => {
      const day = new Date(o.created_at).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })
      dailyMap.set(day, (dailyMap.get(day) || 0) + o.total)
    })

    // ── Ventas por mes (últimos 6 meses) ───────────────────────────────────
    const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
    const salesByMonth = []
    for (let i = 5; i >= 0; i--) {
      const mDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const mEnd  = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const { data: mData } = await supabase
        .from('orders').select('total')
        .in('status', paidStatuses)
        .gte('created_at', mDate.toISOString())
        .lte('created_at', mEnd.toISOString())
      salesByMonth.push({
        name: monthNames[mDate.getMonth()],
        ventas: mData?.reduce((a, o) => a + o.total, 0) || 0,
      })
    }

    // ── Ventas por categoría (basado en order_items + products) ───────────
    const { data: products } = await supabase.from('products').select('category')
    const catMap = new Map<string, number>()
    products?.forEach(p => catMap.set(p.category || 'Otros', (catMap.get(p.category || 'Otros') || 0) + 1))
    const total_ = products?.length || 1
    const salesByCategory = Array.from(catMap.entries())
      .map(([name, count]) => ({ name, value: Math.round((count / total_) * 100) }))

    // ── Cálculo de cambios ────────────────────────────────────────────────
    const totalSalesThisMonth = monthSales?.reduce((a, o) => a + o.total, 0) || 0
    const totalSalesLastMonth = lastMonthSales?.reduce((a, o) => a + o.total, 0) || 0
    const salesGrowth = totalSalesLastMonth > 0
      ? ((totalSalesThisMonth - totalSalesLastMonth) / totalSalesLastMonth * 100) : 0
    const ordersGrowth = (ordersLastMonth || 0) > 0
      ? (((ordersThisMonth || 0) - (ordersLastMonth || 0)) / (ordersLastMonth || 1) * 100) : 0

    return NextResponse.json({
      stats: {
        totalRevenue,                          // All-time real revenue
        totalSales: totalSalesThisMonth,       // This month
        totalOrders: totalOrders || 0,         // All-time orders
        ordersThisMonth: ordersThisMonth || 0,
        totalProducts: totalProducts || 0,
        totalCustomers: totalCustomers || 0,
        newCustomersThisMonth: newCustomers || 0,
        salesChange: Math.round(salesGrowth * 10) / 10,
        ordersChange: Math.round(ordersGrowth * 10) / 10,
        productsChange: 0,
        customersChange: Math.round(((newCustomers || 0) / Math.max(totalCustomers || 1, 1)) * 100 * 10) / 10,
      },
      salesByMonth,
      salesByCategory,
      recentOrders: formattedOrders,
      topProducts,
    })
  } catch (error) {
    console.error('[admin/stats] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
