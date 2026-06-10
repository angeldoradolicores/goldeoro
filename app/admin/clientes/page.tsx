'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Search, Mail, Phone, Calendar, ShoppingBag,
  DollarSign, Loader2, Crown, ChevronRight, User
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Customer {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  created_at: string
  is_admin: boolean
  total_orders: number
  total_spent: number
  last_order_at: string | null
}

function formatPrice(p: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p)
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showBuyersOnly, setShowBuyersOnly] = useState(false)
  const [selected, setSelected] = useState<Customer | null>(null)
  const [selectedOrders, setSelectedOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  useEffect(() => { fetchCustomers() }, [])

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/admin/clients')
      const data = await res.json()
      if (data.customers) setCustomers(data.customers)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const openCustomer = async (customer: Customer) => {
    setSelected(customer)
    setSelectedOrders([])
    setLoadingOrders(true)
    try {
      const res = await fetch(`/api/admin/clients/${customer.id}/orders`)
      const data = await res.json()
      if (data.orders) setSelectedOrders(data.orders)
    } catch (e) { console.error(e) }
    finally { setLoadingOrders(false) }
  }

  const filtered = customers.filter(c => {
    const q = search.toLowerCase()
    const matchesSearch = !search ||
      c.full_name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)

    const matchesBuyer = !showBuyersOnly || c.total_orders > 0
    return matchesSearch && matchesBuyer
  })

  const stats = [
    { label: 'Total Clientes', value: customers.length, icon: Users, color: 'text-purple-400' },
    { label: 'Compradores', value: customers.filter(c => c.total_orders > 0).length, icon: ShoppingBag, color: 'text-blue-400' },
    { label: 'Ingresos Totales', value: formatPrice(customers.reduce((a, c) => a + c.total_spent, 0)), icon: DollarSign, color: 'text-emerald-400' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Clientes</h1>
        <p className="text-muted-foreground">Usuarios registrados en Urban Crown</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 rounded-xl bg-card border border-border/50 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-secondary">
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex items-center gap-2">
          <Button size="sm" variant={showBuyersOnly ? undefined : 'ghost'} onClick={() => setShowBuyersOnly(false)}>Todos</Button>
          <Button size="sm" variant={showBuyersOnly ? 'default' : 'ghost'} onClick={() => setShowBuyersOnly(true)}>Compradores</Button>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email o teléfono..."
            className="pl-9 bg-card border-border/50" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Cliente</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Contacto</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Registro</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Pedidos</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Gastado</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Ver</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0">
                        {c.is_admin
                          ? <Crown className="w-4 h-4 text-primary" />
                          : <User className="w-4 h-4 text-primary/70" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{c.full_name || 'Sin nombre'}</p>
                        {c.is_admin && (
                          <span className="text-xs text-primary font-medium">Admin</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="space-y-0.5">
                      {c.email && (
                        <p className="text-sm flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="w-3 h-3" />{c.email}
                        </p>
                      )}
                      {c.phone && (
                        <p className="text-sm flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="w-3 h-3" />{c.phone}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />{formatDate(c.created_at)}
                    </p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-semibold">{c.total_orders}</span>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <p className="font-semibold text-primary text-sm">{formatPrice(c.total_spent)}</p>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => openCustomer(c)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No se encontraron clientes</p>
          </div>
        )}
      </div>

      {/* Customer Detail */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              {selected?.full_name || 'Cliente'}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              {/* Info */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Email', selected.email],
                  ['Teléfono', selected.phone],
                  ['Registrado', formatDate(selected.created_at)],
                  ['Último pedido', formatDate(selected.last_order_at)],
                  ['Pedidos', selected.total_orders.toString()],
                  ['Total gastado', formatPrice(selected.total_spent)],
                ].map(([l, v]) => (
                  <div key={l as string} className="p-3 rounded-xl bg-secondary/30">
                    <p className="text-xs text-muted-foreground">{l}</p>
                    <p className="text-sm font-medium mt-0.5">{v || '—'}</p>
                  </div>
                ))}
              </div>

              {/* Orders */}
              <div>
                <h4 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">Historial de Pedidos</h4>
                {loadingOrders ? (
                  <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : selectedOrders.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-6">Sin pedidos registrados</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {selectedOrders.map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                        <div>
                          <p className="font-mono text-sm font-semibold text-primary">#{order.order_number}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">{formatPrice(order.total)}</p>
                          <span className="text-xs text-muted-foreground">{order.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
