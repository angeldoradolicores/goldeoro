'use client'

import { motion } from 'framer-motion'
import { Search, Mail, Phone, ShoppingBag, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

const mockCustomers = [
  {
    id: '1',
    name: 'Carlos Rodriguez',
    email: 'carlos@email.com',
    phone: '+57 300 123 4567',
    orders: 5,
    totalSpent: 1450000,
    lastOrder: '2024-01-15',
    status: 'active',
  },
  {
    id: '2',
    name: 'Maria Gonzalez',
    email: 'maria@email.com',
    phone: '+57 310 234 5678',
    orders: 3,
    totalSpent: 870000,
    lastOrder: '2024-01-16',
    status: 'active',
  },
  {
    id: '3',
    name: 'Andres Martinez',
    email: 'andres@email.com',
    phone: '+57 320 345 6789',
    orders: 8,
    totalSpent: 2100000,
    lastOrder: '2024-01-14',
    status: 'vip',
  },
  {
    id: '4',
    name: 'Laura Perez',
    email: 'laura@email.com',
    phone: '+57 315 456 7890',
    orders: 2,
    totalSpent: 520000,
    lastOrder: '2024-01-10',
    status: 'active',
  },
  {
    id: '5',
    name: 'Juan Silva',
    email: 'juan@email.com',
    phone: '+57 300 567 8901',
    orders: 1,
    totalSpent: 185000,
    lastOrder: '2024-01-05',
    status: 'new',
  },
]

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price)
}

export default function ClientesPage() {
  const [search, setSearch] = useState('')

  const filteredCustomers = mockCustomers.filter((customer) =>
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    customer.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Clientes</h1>
        <p className="text-muted-foreground">
          Gestiona la informacion de tus clientes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Clientes', value: mockCustomers.length },
          { label: 'Clientes VIP', value: mockCustomers.filter(c => c.status === 'vip').length },
          { label: 'Nuevos (30 dias)', value: mockCustomers.filter(c => c.status === 'new').length },
          { label: 'Promedio Compras', value: formatPrice(mockCustomers.reduce((acc, c) => acc + c.totalSpent, 0) / mockCustomers.length) },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-xl bg-card border border-border/50"
          >
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar clientes..."
          className="pl-9 bg-card border-border/50"
        />
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer, index) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-6 rounded-2xl bg-card border border-border/50 hover-lift"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {customer.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">{customer.name}</h3>
                  <Badge 
                    variant="outline" 
                    className={
                      customer.status === 'vip' 
                        ? 'bg-primary/20 text-primary border-primary/30' 
                        : customer.status === 'new'
                        ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                        : ''
                    }
                  >
                    {customer.status === 'vip' ? 'VIP' : customer.status === 'new' ? 'Nuevo' : 'Activo'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{customer.phone}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <ShoppingBag className="w-3 h-3" />
                  <span>Pedidos</span>
                </div>
                <p className="font-semibold">{customer.orders}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <Calendar className="w-3 h-3" />
                  <span>Ultimo Pedido</span>
                </div>
                <p className="font-semibold">{customer.lastOrder}</p>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground">Total Gastado</p>
              <p className="text-lg font-bold text-primary">{formatPrice(customer.totalSpent)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
