'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter,
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  ChevronDown,
  ExternalLink,
  DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  price: number
  color?: string
  size?: string
}

interface Order {
  id: string
  reference: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  shipping_city: string
  shipping_department: string
  items: OrderItem[]
  subtotal: number
  shipping_cost: number
  total: number
  status: string
  payment_status: string
  shipping_carrier?: string
  tracking_number?: string
  created_at: string
}

const statusConfig = {
  pending: { label: 'Pendiente', icon: Clock, color: 'bg-yellow-500/20 text-yellow-500' },
  paid: { label: 'Pagado', icon: DollarSign, color: 'bg-green-500/20 text-green-500' },
  processing: { label: 'Procesando', icon: Package, color: 'bg-blue-500/20 text-blue-500' },
  shipped: { label: 'Enviado', icon: Truck, color: 'bg-purple-500/20 text-purple-500' },
  delivered: { label: 'Entregado', icon: CheckCircle, color: 'bg-emerald-500/20 text-emerald-500' },
  cancelled: { label: 'Cancelado', icon: XCircle, color: 'bg-red-500/20 text-red-500' },
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders')
      const data = await response.json()
      if (data.orders) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      })

      if (response.ok) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ))
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus })
        }
      }
    } catch (error) {
      console.error('Error updating order:', error)
    } finally {
      setUpdating(null)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.reference?.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = [
    { label: 'Total Pedidos', value: orders.length, icon: Package },
    { label: 'Pendientes', value: orders.filter(o => o.status === 'pending').length, icon: Clock },
    { label: 'En Camino', value: orders.filter(o => o.status === 'shipped').length, icon: Truck },
    { label: 'Entregados', value: orders.filter(o => o.status === 'delivered').length, icon: CheckCircle },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Pedidos</h1>
        <p className="text-muted-foreground">
          Gestiona los pedidos de tus clientes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-xl bg-card border border-border/50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por referencia, cliente o email..."
            className="pl-9 bg-card border-border/50"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-card border-border/50">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="paid">Pagado</SelectItem>
            <SelectItem value="processing">Procesando</SelectItem>
            <SelectItem value="shipped">Enviado</SelectItem>
            <SelectItem value="delivered">Entregado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left p-4 font-medium text-muted-foreground">Pedido</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Cliente</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Productos</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Total</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Estado</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => {
                const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border/50 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-mono font-medium text-primary">#{order.reference}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                      </div>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <div className="max-w-xs">
                        {order.items?.slice(0, 2).map((item, i) => (
                          <p key={i} className="text-sm truncate">
                            {item.quantity}x {item.product_name}
                          </p>
                        ))}
                        {order.items?.length > 2 && (
                          <p className="text-sm text-muted-foreground">+{order.items.length - 2} mas</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-primary">{formatPrice(order.total)}</p>
                    </td>
                    <td className="p-4">
                      <Badge className={status.color}>
                        <status.icon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={updating === order.id}
                            >
                              {updating === order.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {Object.entries(statusConfig).map(([key, value]) => (
                              <DropdownMenuItem 
                                key={key}
                                onClick={() => updateOrderStatus(order.id, key)}
                                disabled={order.status === key}
                              >
                                <value.icon className="w-4 h-4 mr-2" />
                                {value.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No se encontraron pedidos</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">
              Pedido #{selectedOrder?.reference}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                <div>
                  <p className="text-sm text-muted-foreground">Estado del pedido</p>
                  <Badge className={(statusConfig[selectedOrder.status as keyof typeof statusConfig] || statusConfig.pending).color + ' mt-1'}>
                    {(() => {
                      const StatusIcon = (statusConfig[selectedOrder.status as keyof typeof statusConfig] || statusConfig.pending).icon
                      return <StatusIcon className="w-3 h-3 mr-1" />
                    })()}
                    {(statusConfig[selectedOrder.status as keyof typeof statusConfig] || statusConfig.pending).label}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h4 className="font-semibold mb-3">Informacion del Cliente</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-secondary/30">
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="font-medium">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedOrder.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telefono</p>
                    <p className="font-medium">{selectedOrder.customer_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ciudad</p>
                    <p className="font-medium">{selectedOrder.shipping_city}, {selectedOrder.shipping_department}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Direccion</p>
                    <p className="font-medium">{selectedOrder.shipping_address}</p>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <h4 className="font-semibold mb-3">Productos</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.color && `Color: ${item.color}`}
                          {item.color && item.size && ' | '}
                          {item.size && `Talla: ${item.size}`}
                          {(item.color || item.size) && ' | '}
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-primary">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envio</span>
                  <span>{formatPrice(selectedOrder.shipping_cost)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Tracking */}
              {selectedOrder.tracking_number && (
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Numero de Guia</p>
                      <p className="font-mono font-semibold">{selectedOrder.tracking_number}</p>
                      {selectedOrder.shipping_carrier && (
                        <p className="text-sm text-muted-foreground">{selectedOrder.shipping_carrier}</p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`https://www.interrapidisimo.com/rastrear-guia/${selectedOrder.tracking_number}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Rastrear
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setSelectedOrder(null)} className="flex-1">
                  Cerrar
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="flex-1 btn-luxury">
                      Cambiar Estado
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {Object.entries(statusConfig).map(([key, value]) => (
                      <DropdownMenuItem 
                        key={key}
                        onClick={() => updateOrderStatus(selectedOrder.id, key)}
                        disabled={selectedOrder.status === key}
                      >
                        <value.icon className="w-4 h-4 mr-2" />
                        {value.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
