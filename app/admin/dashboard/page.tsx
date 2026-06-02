'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Users, 
  TrendingUp, 
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface Stats {
  totalSales: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  salesChange: number
  ordersChange: number
  productsChange: number
  customersChange: number
}

interface RecentOrder {
  id: string
  reference: string
  customer_name: string
  product_name: string
  total: number
  status: string
}

interface CategorySales {
  name: string
  value: number
  color: string
}

const categoryColors: Record<string, string> = {
  'Premium': '#d4af37',
  'Urban': '#a08730',
  'Snapback': '#7a6525',
  'Classic': '#544619',
  'Sport': '#2e260e',
  'Otros': '#1a1a1a',
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    notation: 'compact',
  }).format(price)
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [salesData, setSalesData] = useState<{ name: string; ventas: number }[]>([])
  const [categoryData, setCategoryData] = useState<CategorySales[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()
      
      if (data.stats) {
        setStats(data.stats)
      }
      if (data.recentOrders) {
        setRecentOrders(data.recentOrders)
      }
      if (data.salesByMonth) {
        setSalesData(data.salesByMonth)
      }
      if (data.salesByCategory) {
        setCategoryData(data.salesByCategory.map((cat: any) => ({
          ...cat,
          color: categoryColors[cat.name] || categoryColors['Otros']
        })))
      }
      if (data.topProducts) {
        setTopProducts(data.topProducts)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const statsCards = [
    { 
      label: 'Ventas del Mes', 
      value: formatPrice(stats?.totalSales || 0), 
      change: `${stats?.salesChange || 0}%`, 
      trend: (stats?.salesChange || 0) >= 0 ? 'up' : 'down',
      icon: DollarSign,
      color: 'text-emerald-500'
    },
    { 
      label: 'Pedidos', 
      value: stats?.totalOrders?.toString() || '0', 
      change: `${stats?.ordersChange || 0}%`, 
      trend: (stats?.ordersChange || 0) >= 0 ? 'up' : 'down',
      icon: ShoppingBag,
      color: 'text-blue-500'
    },
    { 
      label: 'Productos', 
      value: stats?.totalProducts?.toString() || '0', 
      change: `+${stats?.productsChange || 0}`, 
      trend: 'up',
      icon: Package,
      color: 'text-primary'
    },
    { 
      label: 'Clientes', 
      value: stats?.totalCustomers?.toString() || '0', 
      change: `${stats?.customersChange || 0}%`, 
      trend: (stats?.customersChange || 0) >= 0 ? 'up' : 'down',
      icon: Users,
      color: 'text-purple-500'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Bienvenido de vuelta. Aqui esta el resumen de tu tienda.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-2xl bg-card border border-border/50 hover-lift"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl bg-secondary ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold">Ventas Mensuales</h3>
              <p className="text-sm text-muted-foreground">Ultimos 6 meses</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-500">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+{stats?.salesChange || 0}%</span>
            </div>
          </div>
          <div className="h-[300px]">
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickFormatter={(value) => formatPrice(value)}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [formatPrice(value), 'Ventas']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ventas" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No hay datos de ventas disponibles
              </div>
            )}
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-card border border-border/50"
        >
          <h3 className="font-semibold mb-6">Ventas por Categoria</h3>
          <div className="h-[200px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value}%`, 'Porcentaje']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No hay datos
              </div>
            )}
          </div>
          <div className="mt-4 space-y-2">
            {categoryData.map((category) => (
              <div key={category.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-muted-foreground">{category.name}</span>
                </div>
                <span className="font-medium">{category.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl bg-card border border-border/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Pedidos Recientes</h3>
            <a href="/admin/pedidos" className="text-sm text-primary hover:underline">
              Ver todos
            </a>
          </div>
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{order.product_name || 'Multiples productos'}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_name}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-primary">
                      {formatPrice(order.total)}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-500' :
                      order.status === 'shipped' ? 'bg-blue-500/20 text-blue-500' :
                      order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-500' :
                      order.status === 'paid' ? 'bg-green-500/20 text-green-500' :
                      'bg-gray-500/20 text-gray-500'
                    }`}>
                      {order.status === 'delivered' ? 'Entregado' :
                       order.status === 'shipped' ? 'Enviado' :
                       order.status === 'processing' ? 'Procesando' :
                       order.status === 'paid' ? 'Pagado' :
                       'Pendiente'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay pedidos recientes
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-6 rounded-2xl bg-card border border-border/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Productos Mas Vendidos</h3>
            <a href="/admin/productos" className="text-sm text-primary hover:underline">
              Ver todos
            </a>
          </div>
          <div className="space-y-4">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">
                      {formatPrice(product.price)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.total_sold || 0} vendidos
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay productos disponibles
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
