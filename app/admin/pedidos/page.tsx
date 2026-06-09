'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, Eye, Package, Truck, CheckCircle, Clock, XCircle,
  Loader2, ChevronDown, ExternalLink, DollarSign, Send, X, Camera,
  MessageSquare, Hash, Building2, AlertCircle, Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  price: number
  color?: string
  size?: string
  product_image?: string
}

interface Order {
  id: string
  order_number: string
  created_at: string
  status: string
  subtotal: number
  shipping_cost: number
  total: number
  shipping_method: string
  payment_method?: string
  tracking_number?: string
  carrier?: string
  tracking_photo_url?: string
  admin_note?: string
  shipped_at?: string
  delivered_at?: string
  shipping_address: {
    name: string
    phone: string
    email: string
    address: string
    city: string
    state: string
    postal_code?: string
  }
  items: OrderItem[]
}

const statusConfig = {
  pending:    { label: 'Pendiente',   icon: Clock,         color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  paid:       { label: 'Pagado',      icon: DollarSign,    color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  processing: { label: 'Procesando',  icon: Package,       color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  shipped:    { label: 'Enviado',     icon: Truck,         color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  delivered:  { label: 'Entregado',   icon: CheckCircle,   color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  cancelled:  { label: 'Cancelado',   icon: XCircle,       color: 'bg-red-500/20 text-red-400 border-red-500/30' },
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showShippingModal, setShowShippingModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const [shippingForm, setShippingForm] = useState({
    status: '',
    tracking_number: '',
    carrier: 'InterRapidisimo',
    tracking_photo_url: '',
    admin_note: '',
  })

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders')
      const data = await res.json()
      if (data.orders) setOrders(data.orders)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const openShippingModal = (order: Order) => {
    setSelectedOrder(order)
    setShippingForm({
      status: order.status,
      tracking_number: order.tracking_number || '',
      carrier: order.carrier || 'InterRapidisimo',
      tracking_photo_url: order.tracking_photo_url || '',
      admin_note: order.admin_note || '',
    })
    setShowShippingModal(true)
  }

  const handleSaveShipping = async () => {
    if (!selectedOrder) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/shipping`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shippingForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Update local state
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, ...shippingForm } : o))
      toast.success('Envío actualizado y cliente notificado ✅')
      setShowShippingModal(false)
    } catch (e: any) {
      toast.error(e.message || 'Error al actualizar el envío')
    } finally {
      setSaving(false)
    }
  }

  const filteredOrders = orders.filter(o => {
    const addr = o.shipping_address || {}
    const search_ = search.toLowerCase()
    const matchSearch = !search ||
      o.order_number?.toLowerCase().includes(search_) ||
      addr.name?.toLowerCase().includes(search_) ||
      addr.email?.toLowerCase().includes(search_) ||
      addr.phone?.includes(search)
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = [
    { label: 'Total',       value: orders.length,                                          icon: Package,     color: 'text-primary' },
    { label: 'Pendientes',  value: orders.filter(o => o.status === 'pending' || o.status === 'paid' || o.status === 'processing').length, icon: Clock, color: 'text-yellow-400' },
    { label: 'En Camino',   value: orders.filter(o => o.status === 'shipped').length,       icon: Truck,       color: 'text-purple-400' },
    { label: 'Entregados',  value: orders.filter(o => o.status === 'delivered').length,     icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Ingresos',    value: formatPrice(orders.filter(o => o.status !== 'cancelled' && o.status !== 'pending').reduce((a, o) => a + (o.total || 0), 0)), icon: DollarSign, color: 'text-green-400' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Pedidos</h1>
        <p className="text-muted-foreground">Gestiona y notifica el envío de cada pedido</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="p-4 rounded-xl bg-card border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-xl font-bold">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por número, cliente, email o teléfono..."
            className="pl-9 bg-card border-border/50" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-card border-border/50">
            <Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(statusConfig).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Pedido</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm hidden md:table-cell">Cliente</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm hidden lg:table-cell">Productos</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Total</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Estado</th>
                <th className="text-right p-4 font-medium text-muted-foreground text-sm">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, i) => {
                const st = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
                return (
                  <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                    <td className="p-4">
                      <p className="font-mono font-semibold text-primary text-sm">#{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                      {order.tracking_number && (
                        <p className="text-xs text-purple-400 mt-0.5">📦 {order.tracking_number}</p>
                      )}
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <p className="font-medium text-sm">{order.shipping_address?.name}</p>
                      <p className="text-xs text-muted-foreground">{order.shipping_address?.email}</p>
                      <p className="text-xs text-muted-foreground">{order.shipping_address?.phone}</p>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <div className="max-w-xs">
                        {order.items?.slice(0, 2).map((item, ii) => (
                          <p key={ii} className="text-sm truncate">{item.quantity}x {item.product_name}</p>
                        ))}
                        {(order.items?.length || 0) > 2 && (
                          <p className="text-xs text-muted-foreground">+{order.items.length - 2} más</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-primary">{formatPrice(order.total)}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${st.color}`}>
                        <st.icon className="w-3 h-3" />{st.label}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedOrder(order); setShowShippingModal(false) }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                          onClick={() => openShippingModal(order)}>
                          <Truck className="w-3.5 h-3.5 mr-1" /> Gestionar
                        </Button>
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
            <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No se encontraron pedidos</p>
          </div>
        )}
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder && !showShippingModal} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Pedido #{selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-5">
              {/* Status */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                {(() => { const st = statusConfig[selectedOrder.status as keyof typeof statusConfig] || statusConfig.pending; return (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${st.color}`}>
                    <st.icon className="w-4 h-4" />{st.label}
                  </span>
                )})()}
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Fecha</p>
                  <p className="text-sm font-medium">{formatDate(selectedOrder.created_at)}</p>
                </div>
              </div>

              {/* Customer */}
              <div>
                <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Cliente & Dirección</h4>
                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-secondary/30">
                  {[
                    ['Nombre', selectedOrder.shipping_address?.name],
                    ['Email', selectedOrder.shipping_address?.email],
                    ['Teléfono', selectedOrder.shipping_address?.phone],
                    ['Ciudad', `${selectedOrder.shipping_address?.city}, ${selectedOrder.shipping_address?.state}`],
                  ].map(([l, v]) => (
                    <div key={l as string}>
                      <p className="text-xs text-muted-foreground">{l}</p>
                      <p className="text-sm font-medium">{v || '—'}</p>
                    </div>
                  ))}
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Dirección</p>
                    <p className="text-sm font-medium">{selectedOrder.shipping_address?.address}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Productos</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-secondary/30">
                      <div>
                        <p className="font-medium text-sm">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {[item.color && `Color: ${item.color}`, item.size && `Talla: ${item.size}`, `x${item.quantity}`].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      <p className="font-semibold text-primary text-sm">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(selectedOrder.subtotal)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Envío</span><span>{formatPrice(selectedOrder.shipping_cost)}</span></div>
                <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-primary">{formatPrice(selectedOrder.total)}</span></div>
              </div>

              {/* Tracking Info if set */}
              {selectedOrder.tracking_number && (
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-medium text-sm mb-2">
                    <Truck className="w-4 h-4" /> Info de Envío
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-muted-foreground">Transportadora</p><p className="font-medium">{selectedOrder.carrier || '—'}</p></div>
                    <div><p className="text-xs text-muted-foreground">Número de Guía</p><p className="font-mono font-medium">{selectedOrder.tracking_number}</p></div>
                  </div>
                  {selectedOrder.tracking_photo_url && (
                    <a href={selectedOrder.tracking_photo_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                      <Camera className="w-3 h-3" /> Ver foto de la guía
                    </a>
                  )}
                  {selectedOrder.admin_note && (
                    <p className="text-sm italic text-muted-foreground">"{selectedOrder.admin_note}"</p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2 border-t border-border">
                <Button variant="outline" onClick={() => setSelectedOrder(null)} className="flex-1">Cerrar</Button>
                <Button className="flex-1 btn-luxury" onClick={() => openShippingModal(selectedOrder)}>
                  <Truck className="w-4 h-4 mr-2" /> Gestionar Envío
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Shipping Management Modal */}
      <Dialog open={showShippingModal} onOpenChange={() => setShowShippingModal(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              Gestionar Envío — #{selectedOrder?.order_number}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Alert about notification */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Bell className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Al guardar, el cliente recibirá una <strong className="text-foreground">notificación automática</strong> con el estado del pedido.
              </p>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-primary" /> Estado del pedido
              </label>
              <Select value={shippingForm.status} onValueChange={v => setShippingForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      <span className="flex items-center gap-2">
                        <v.icon className="w-4 h-4" /> {v.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Carrier */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-primary" /> Transportadora
              </label>
              <Select value={shippingForm.carrier} onValueChange={v => setShippingForm(f => ({ ...f, carrier: v }))}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['InterRapidisimo', 'Servientrega', 'Coordinadora', 'TCC', 'Envia', 'Otra'].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tracking number */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-2">
                <Hash className="w-3.5 h-3.5 text-primary" /> Número de guía
              </label>
              <Input
                value={shippingForm.tracking_number}
                onChange={e => setShippingForm(f => ({ ...f, tracking_number: e.target.value }))}
                placeholder="Ej: 123456789"
                className="bg-secondary border-border font-mono"
              />
            </div>

            {/* Photo URL */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-2">
                <Camera className="w-3.5 h-3.5 text-primary" /> Foto de la guía (URL)
              </label>
              <Input
                value={shippingForm.tracking_photo_url}
                onChange={e => setShippingForm(f => ({ ...f, tracking_photo_url: e.target.value }))}
                placeholder="https://... (link de Google Drive, WhatsApp, etc.)"
                className="bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground">Pega el link de la foto de la guía. El cliente podrá verla en su perfil.</p>
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-primary" /> Comentario para el cliente
              </label>
              <textarea
                value={shippingForm.admin_note}
                onChange={e => setShippingForm(f => ({ ...f, admin_note: e.target.value }))}
                placeholder="Ej: Tu pedido fue entregado a la transportadora hoy a las 3pm..."
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg bg-secondary border border-border resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex gap-3 pt-2 border-t border-border">
              <Button variant="outline" onClick={() => setShowShippingModal(false)} className="flex-1" disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSaveShipping} disabled={saving} className="flex-1 btn-luxury">
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Guardando...</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" /> Guardar y Notificar</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
