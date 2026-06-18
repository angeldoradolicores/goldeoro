'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign, ShoppingBag, Package, Users, TrendingUp,
  ArrowUpRight, ArrowDownRight, Loader2, Star, BarChart2
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts'
import Link from 'next/link'

const PIE_COLORS = ['#d4af37','#a08730','#7a6525','#9b59b6','#3498db','#2ecc71']

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0, notation: 'compact'
  }).format(price)
}

function formatPriceFull(price: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0
  }).format(price)
}

const statusLabel: Record<string, string> = {
  pending: 'Pendiente', paid: 'Pagado', processing: 'Procesando',
  shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado',
}
const statusColor: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  paid: 'bg-green-500/20 text-green-400',
  processing: 'bg-blue-500/20 text-blue-400',
  shipped: 'bg-purple-500/20 text-purple-400',
  delivered: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('monthly')

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  const stats = data?.stats || {}
  const topProducts = data?.topProducts || []
  const salesByDay = data?.salesByDay || []
  const salesByWeek = data?.salesByWeek || []
  const salesByMonth = data?.salesByMonth || []
  const salesByQuarter = data?.salesByQuarter || []
  const salesByCategory = data?.salesByCategory || []
  const recentOrders = data?.recentOrders || []

  const salesOptions = [
    { key: 'daily', label: 'Diario' },
    { key: 'weekly', label: 'Semanal' },
    { key: 'monthly', label: 'Mensual' },
    { key: 'quarterly', label: 'Trimestral' },
  ] as const

  const chartData = {
    daily: salesByDay,
    weekly: salesByWeek,
    monthly: salesByMonth,
    quarterly: salesByQuarter,
  }[timeframe]

  const timeframeLabel = salesOptions.find(option => option.key === timeframe)?.label || 'Mensual'

  const cards = [
    {
      label: 'Ingresos Totales',
      value: formatPriceFull(stats.totalRevenue || 0),
      sub: 'Todos los tiempos',
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      change: null,
    },
    {
      label: 'Ventas Este Mes',
      value: formatPrice(stats.totalSales || 0),
      sub: `${stats.salesChange >= 0 ? '+' : ''}${stats.salesChange || 0}% vs mes anterior`,
      icon: TrendingUp,
      color: 'text-primary',
      bg: 'bg-primary/10',
      change: stats.salesChange,
    },
    {
      label: 'Total Pedidos',
      value: (stats.totalOrders || 0).toString(),
      sub: `${stats.ordersThisMonth || 0} este mes`,
      icon: ShoppingBag,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      change: stats.ordersChange,
    },
    {
      label: 'Productos',
      value: (stats.totalProducts || 0).toString(),
      sub: 'En catálogo',
      icon: Package,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      change: null,
    },
    {
      label: 'Clientes',
      value: (stats.totalCustomers || 0).toString(),
      sub: `${stats.newCustomersThisMonth || 0} nuevos este mes`,
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      change: stats.customersChange,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Métricas reales de tu tienda Gol de Oro</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/20 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              {card.change !== null && card.change !== undefined && (
                <div className={`flex items-center gap-0.5 text-xs font-medium ${card.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {card.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(card.change)}%
                </div>
              )}
            </div>
            <p className="text-xl font-bold leading-tight">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Sales Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h3 className="font-semibold">Ventas {timeframeLabel}</h3>
              <p className="text-sm text-muted-foreground">Visualiza el comportamiento diario, semanal, mensual y trimestral</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {salesOptions.map(option => (
                <button
                  key={option.key}
                  onClick={() => setTimeframe(option.key)}
                  className={`rounded-full px-3 py-1.5 text-sm transition ${timeframe === option.key ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-secondary/70 text-muted-foreground hover:bg-secondary'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[280px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false}
                    tickFormatter={v => formatPrice(v as number)} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px' }}
                    formatter={(v: number) => [formatPriceFull(v), 'Ventas']}
                  />
                  <Bar dataKey="ventas" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No hay datos de ventas para este período
              </div>
            )}
          </div>
        </motion.div>

        {/* Category Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-card border border-border/50">
          <h3 className="font-semibold mb-5">Productos por Categoría</h3>
          <div className="h-[160px]">
            {salesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={salesByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={70}
                    paddingAngle={4} dataKey="value">
                    {salesByCategory.map((_: any, idx: number) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(v: number) => [`${v}%`, 'Porcentaje']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Sin datos</div>
            )}
          </div>
          <div className="mt-3 space-y-1.5">
            {salesByCategory.slice(0, 4).map((cat: any, idx: number) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span className="text-muted-foreground truncate max-w-[100px]">{cat.name}</span>
                </div>
                <span className="font-medium">{cat.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl bg-card border border-border/50">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold">Pedidos Recientes</h3>
            <Link href="/admin/pedidos" className="text-sm text-primary hover:underline">Ver todos →</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length > 0 ? recentOrders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div>
                  <p className="font-mono text-sm font-semibold text-primary">#{order.reference}</p>
                  <p className="text-xs text-muted-foreground">{order.customer_name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-bold">{formatPrice(order.total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[order.status] || 'bg-secondary text-muted-foreground'}`}>
                    {statusLabel[order.status] || order.status}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-center text-muted-foreground py-8 text-sm">No hay pedidos aún</p>
            )}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-6 rounded-2xl bg-card border border-border/50">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold">Más Vendidos</h3>
            <Link href="/admin/productos" className="text-sm text-primary hover:underline">Ver todos →</Link>
          </div>
          <div className="space-y-3">
            {topProducts.length > 0 ? topProducts.map((product: any, i: number) => (
              <div key={product.name} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.total_sold} unidades vendidas</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-primary">{formatPrice(product.revenue)}</p>
                  <div className="flex items-center gap-0.5 justify-end">
                    <Star className="w-2.5 h-2.5 text-primary fill-primary" />
                    <span className="text-xs text-muted-foreground">ingresos</span>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-center text-muted-foreground py-8 text-sm">No hay datos de ventas aún</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
