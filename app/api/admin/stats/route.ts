import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
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
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Get various stats
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Total sales this month
    const { data: monthSales } = await supabase
      .from('orders')
      .select('total')
      .in('status', ['paid', 'processing', 'shipped', 'delivered'])
      .gte('created_at', startOfMonth.toISOString())

    // Total sales last month
    const { data: lastMonthSales } = await supabase
      .from('orders')
      .select('total')
      .in('status', ['paid', 'processing', 'shipped', 'delivered'])
      .gte('created_at', startOfLastMonth.toISOString())
      .lte('created_at', endOfLastMonth.toISOString())

    // Orders this month
    const { count: ordersThisMonth } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())

    // Orders last month
    const { count: ordersLastMonth } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfLastMonth.toISOString())
      .lte('created_at', endOfLastMonth.toISOString())

    // Total products
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    // Total customers
    const { count: totalCustomers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_admin', false)

    // New customers this month
    const { count: newCustomers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_admin', false)
      .gte('created_at', startOfMonth.toISOString())

    // Recent orders with product info
    const { data: recentOrders } = await supabase
      .from('orders')
      .select(`
        id,
        reference,
        total,
        status,
        created_at,
        shipping_name
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    // Format recent orders
    const formattedOrders = recentOrders?.map(order => ({
      id: order.id,
      reference: order.reference,
      customer_name: order.shipping_name || 'Cliente',
      product_name: 'Pedido',
      total: order.total,
      status: order.status,
    })) || []

    // Top products by stock (since we don't track sales per product yet)
    const { data: topProducts } = await supabase
      .from('products')
      .select('id, name, category, price, stock')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(5)

    // Sales by category - calculate percentages
    const { data: products } = await supabase
      .from('products')
      .select('category')

    const categoryMap = new Map<string, number>()
    products?.forEach(p => {
      categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + 1)
    })

    const totalProductsCount = products?.length || 1
    const salesByCategory = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      value: Math.round((count / totalProductsCount) * 100),
    }))

    // Generate sales by month data (last 6 months)
    const salesByMonth = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const { data: monthData } = await supabase
        .from('orders')
        .select('total')
        .in('status', ['paid', 'processing', 'shipped', 'delivered'])
        .gte('created_at', monthDate.toISOString())
        .lte('created_at', monthEnd.toISOString())

      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      const monthTotal = monthData?.reduce((acc, o) => acc + o.total, 0) || 0
      
      salesByMonth.push({
        name: monthNames[monthDate.getMonth()],
        ventas: monthTotal,
      })
    }

    // Calculate totals
    const totalSalesThisMonth = monthSales?.reduce((acc, o) => acc + o.total, 0) || 0
    const totalSalesLastMonth = lastMonthSales?.reduce((acc, o) => acc + o.total, 0) || 0
    const salesGrowth = totalSalesLastMonth > 0 
      ? ((totalSalesThisMonth - totalSalesLastMonth) / totalSalesLastMonth * 100)
      : 0

    const ordersGrowth = ordersLastMonth && ordersLastMonth > 0
      ? ((((ordersThisMonth || 0) - ordersLastMonth) / ordersLastMonth) * 100)
      : 0

    const customersGrowth = (totalCustomers || 1) > 0
      ? (((newCustomers || 0) / (totalCustomers || 1)) * 100)
      : 0

    return NextResponse.json({
      stats: {
        totalSales: totalSalesThisMonth,
        totalOrders: ordersThisMonth || 0,
        totalProducts: totalProducts || 0,
        totalCustomers: totalCustomers || 0,
        salesChange: Math.round(salesGrowth * 10) / 10,
        ordersChange: Math.round(ordersGrowth * 10) / 10,
        productsChange: 0,
        customersChange: Math.round(customersGrowth * 10) / 10,
      },
      salesByMonth,
      salesByCategory,
      recentOrders: formattedOrders,
      topProducts: topProducts?.map(p => ({
        ...p,
        total_sold: 0, // We don't track this yet
      })) || [],
    })
  } catch (error) {
    console.error('[v0] Admin stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
