'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Package, Heart, MapPin, CreditCard, Bell, Shield,
  LogOut, ChevronRight, Edit2, Camera, Crown, Save, X, Plus, Trash2,
  Check, Loader2, ShoppingCart, Truck, CheckCircle, Clock, XCircle,
  Hash, ExternalLink, MessageSquare, ChevronDown, ChevronUp, DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useCartStore, useFavoritesStore, useAuthStore } from '@/lib/store'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const ORDER_STEPS = [
  { key: 'pending',    label: 'Pedido recibido',    icon: Clock },
  { key: 'paid',       label: 'Pago confirmado',     icon: DollarSign },
  { key: 'processing', label: 'Preparando envío',    icon: Package },
  { key: 'shipped',    label: 'En camino',           icon: Truck },
  { key: 'delivered',  label: 'Entregado',           icon: CheckCircle },
]

const STATUS_ORDER = ['pending','paid','processing','shipped','delivered']

function OrderTimeline({ status }: { status: string }) {
  const currentIdx = STATUS_ORDER.indexOf(status)
  const isCancelled = status === 'cancelled'
  return (
    <div className="relative">
      {isCancelled ? (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <XCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm font-medium text-red-400">Pedido cancelado</p>
        </div>
      ) : (
        <div className="flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-border z-0">
            <div
              className="h-full bg-primary transition-all duration-700"
              style={{ width: currentIdx >= 0 ? `${(currentIdx / (ORDER_STEPS.length - 1)) * 100}%` : '0%' }}
            />
          </div>
          {ORDER_STEPS.map((step, i) => {
            const done = i <= currentIdx
            const active = i === currentIdx
            return (
              <div key={step.key} className="flex flex-col items-center gap-1.5 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  done ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                } ${active ? 'ring-4 ring-primary/20 scale-110' : ''}`}>
                  <step.icon className="w-3.5 h-3.5" />
                </div>
                <p className={`text-xs text-center leading-tight max-w-[60px] ${done ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {step.label}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface Order {
  id: string
  order_number: string
  created_at: string
  status: string
  total: number
  subtotal: number
  shipping_cost: number
  tracking_number?: string
  carrier?: string
  tracking_photo_url?: string
  admin_note?: string
  shipped_at?: string
  items?: { product_name: string; quantity: number; price: number; color?: string; size?: string }[]
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  created_at: string
  order_id?: string
}

interface Address {
  id: string; full_name: string; street: string; city: string
  state: string; country: string; postal_code: string; phone: string; is_default: boolean
}

const emptyAddress: Omit<Address, 'id'> = {
  full_name: '', street: '', city: '', state: '', country: 'Colombia', postal_code: '', phone: '', is_default: false,
}

const menuItems = [
  { icon: User,     label: 'Mis Datos',       id: 'datos' },
  { icon: Package,  label: 'Mis Pedidos',      id: 'pedidos' },
  { icon: Bell,     label: 'Notificaciones',   id: 'notificaciones' },
  { icon: Heart,    label: 'Favoritos',        id: 'favoritos' },
  { icon: MapPin,   label: 'Direcciones',      id: 'direcciones' },
  { icon: Shield,   label: 'Seguridad',        id: 'seguridad' },
]

export default function PerfilPage() {
  const router = useRouter()
  const supabase = createClient()
  const { addItem } = useCartStore()
  const { items: favorites, toggleFavorite, syncFavorites } = useFavoritesStore()

  const [activeSection, setActiveSection] = useState('datos')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingData, setEditingData] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [userData, setUserData] = useState({ nombre: '', apellido: '', email: '', telefono: '', fechaNacimiento: '', avatarUrl: '' })
  const [editForm, setEditForm] = useState({ ...userData })

  const [orders, setOrders] = useState<Order[]>([])
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [addressForm, setAddressForm] = useState<Omit<Address, 'id'>>(emptyAddress)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth/login'); return }
      setUserId(session.user.id)
      useCartStore.getState().syncCart()

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle()
      if (profile) {
        const parts = profile.full_name ? profile.full_name.split(' ') : ['']
        const d = { nombre: parts[0] || '', apellido: parts.slice(1).join(' ') || '', email: profile.email || session.user.email || '', telefono: profile.phone || '', fechaNacimiento: profile.birth_date || '', avatarUrl: profile.avatar_url || '' }
        setUserData(d); setEditForm(d)
      } else {
        const d = { nombre: '', apellido: '', email: session.user.email || '', telefono: '', fechaNacimiento: '', avatarUrl: '' }
        setUserData(d); setEditForm(d)
      }

      // Fetch orders with items
      const { data: userOrders } = await supabase
        .from('orders')
        .select('id, order_number, created_at, status, total, subtotal, shipping_cost, tracking_number, carrier, tracking_photo_url, admin_note, shipped_at, items:order_items(product_name, quantity, price, color, size)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
      if (userOrders) setOrders(userOrders as Order[])

      // Fetch notifications
      fetchNotifications()

      // Fetch addresses
      const { data: userAddresses } = await supabase.from('addresses').select('*').eq('user_id', session.user.id).order('is_default', { ascending: false })
      if (userAddresses) setAddresses(userAddresses as Address[])

      await syncFavorites()
      setLoading(false)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      if (data.notifications) setNotifications(data.notifications)
    } catch (e) { console.error(e) }
  }

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleLogout = async () => {
    await useAuthStore.getState().logout()
    router.push('/')
  }

  const handleSaveProfile = async () => {
    if (!userId) return
    setSaving(true)
    const fullName = `${editForm.nombre} ${editForm.apellido}`.trim()
    const { error } = await supabase.from('profiles').update({ full_name: fullName, phone: editForm.telefono, birth_date: editForm.fechaNacimiento || null, updated_at: new Date().toISOString() }).eq('id', userId)
    if (error) { toast.error('Error al guardar los datos') }
    else { setUserData({ ...editForm }); setEditingData(false); toast.success('Datos guardados correctamente') }
    setSaving(false)
  }

  const handleSaveAddress = async () => {
    if (!userId) return
    setSaving(true)
    if (editingAddress) {
      const { error } = await supabase.from('addresses').update(addressForm).eq('id', editingAddress.id)
      if (!error) { setAddresses(prev => prev.map(a => a.id === editingAddress.id ? { ...addressForm, id: editingAddress.id } : a)); toast.success('Dirección actualizada') }
      else toast.error('Error al actualizar la dirección')
    } else {
      const { data, error } = await supabase.from('addresses').insert({ ...addressForm, user_id: userId }).select().single()
      if (!error && data) { setAddresses(prev => [...prev, data as Address]); toast.success('Dirección agregada') }
      else toast.error('Error al agregar la dirección')
    }
    setShowAddressForm(false); setEditingAddress(null); setAddressForm(emptyAddress); setSaving(false)
  }

  const handleDeleteAddress = async (id: string) => {
    const { error } = await supabase.from('addresses').delete().eq('id', id)
    if (!error) { setAddresses(prev => prev.filter(a => a.id !== id)); toast.success('Dirección eliminada') }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) { toast.error('Las contraseñas no coinciden'); return }
    if (newPassword.length < 6) { toast.error('Mínimo 6 caracteres'); return }
    setChangingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) toast.error('Error al cambiar la contraseña')
    else { toast.success('Contraseña actualizada'); setNewPassword(''); setConfirmPassword('') }
    setChangingPassword(false)
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'datos':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Mis Datos</h2>
              {!editingData ? (
                <Button variant="outline" size="sm" className="border-gold/30 hover:bg-gold/10" onClick={() => setEditingData(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setEditingData(false); setEditForm({ ...userData }) }}><X className="w-4 h-4 mr-1" />Cancelar</Button>
                  <Button size="sm" className="bg-gold hover:bg-gold/90 text-background" onClick={handleSaveProfile} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}Guardar
                  </Button>
                </div>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[['Nombre', 'nombre'], ['Apellido', 'apellido']].map(([label, key]) => (
                <div key={key} className="space-y-2">
                  <label className="text-sm text-muted-foreground">{label}</label>
                  <Input value={editingData ? editForm[key as keyof typeof editForm] : userData[key as keyof typeof userData]} readOnly={!editingData} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))} className="bg-card/50 border-border" />
                </div>
              ))}
              <div className="space-y-2"><label className="text-sm text-muted-foreground">Email</label><Input value={userData.email} readOnly className="bg-card/50 border-border opacity-70" /></div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Teléfono</label>
                <Input value={editingData ? editForm.telefono : userData.telefono} readOnly={!editingData} onChange={e => setEditForm(f => ({ ...f, telefono: e.target.value }))} className="bg-card/50 border-border" placeholder={editingData ? '+57 300 000 0000' : ''} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm text-muted-foreground">Fecha de Nacimiento</label>
                <Input type="date" value={editingData ? editForm.fechaNacimiento : userData.fechaNacimiento} readOnly={!editingData} onChange={e => setEditForm(f => ({ ...f, fechaNacimiento: e.target.value }))} className="bg-card/50 border-border" />
              </div>
            </div>
          </motion.div>
        )

      case 'pedidos':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <h2 className="text-2xl font-bold">Mis Pedidos</h2>
            {orders.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Aún no tienes pedidos.</p>
                <Link href="/catalogo"><Button className="bg-gold hover:bg-gold/90 text-background">Ir al Catálogo</Button></Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-card/50 border border-border rounded-2xl overflow-hidden hover:border-gold/20 transition-colors">
                    {/* Order Header */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="font-mono font-bold text-primary">#{order.order_number}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(order.created_at)}</p>
                        </div>
                        <p className="text-xl font-bold text-gold">{formatPrice(order.total)}</p>
                      </div>

                      {/* Timeline */}
                      <OrderTimeline status={order.status} />

                      {/* Tracking info */}
                      {order.tracking_number && (
                        <div className="mt-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                          <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
                            <Truck className="w-4 h-4" /> Información de Envío
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {order.carrier && <div><p className="text-xs text-muted-foreground">Transportadora</p><p className="font-medium">{order.carrier}</p></div>}
                            <div><p className="text-xs text-muted-foreground">Número de Guía</p><p className="font-mono font-medium">{order.tracking_number}</p></div>
                          </div>
                          {order.tracking_photo_url && (
                            <a href={order.tracking_photo_url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                              <ExternalLink className="w-3 h-3" /> Ver foto de la guía
                            </a>
                          )}
                          {order.admin_note && (
                            <div className="flex items-start gap-2 mt-1">
                              <MessageSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                              <p className="text-xs text-muted-foreground italic">"{order.admin_note}"</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Expand toggle */}
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors pt-3 border-t border-border/50"
                      >
                        {expandedOrder === order.id ? <><ChevronUp className="w-4 h-4" /> Ocultar productos</> : <><ChevronDown className="w-4 h-4" /> Ver productos</>}
                      </button>
                    </div>

                    {/* Expanded items */}
                    <AnimatePresence>
                      {expandedOrder === order.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="border-t border-border/50 bg-secondary/20 px-5 pb-5 pt-4 space-y-3">
                          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Productos</p>
                          {order.items?.map((item, i) => (
                            <div key={i} className="flex justify-between items-center">
                              <div>
                                <p className="text-sm font-medium">{item.product_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {[item.color && `Color: ${item.color}`, item.size && `Talla: ${item.size}`, `x${item.quantity}`].filter(Boolean).join(' · ')}
                                </p>
                              </div>
                              <p className="text-sm font-semibold text-primary">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                          ))}
                          <div className="pt-3 border-t border-border/50 space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                            <div className="flex justify-between text-xs text-muted-foreground"><span>Envío</span><span>{formatPrice(order.shipping_cost)}</span></div>
                            <div className="flex justify-between font-bold"><span>Total</span><span className="text-gold">{formatPrice(order.total)}</span></div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )

      case 'notificaciones':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Notificaciones</h2>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs text-muted-foreground hover:text-foreground">
                  Marcar todas como leídas
                </Button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="text-center py-16">
                <Bell className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No tienes notificaciones.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map(notif => (
                  <motion.div key={notif.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-2xl border transition-colors ${notif.read ? 'bg-card/30 border-border/30' : 'bg-card border-gold/30'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${notif.read ? 'bg-muted-foreground/30' : 'bg-gold'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${notif.read ? 'text-muted-foreground' : 'text-foreground'}`}>{notif.title}</p>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{notif.message}</p>
                        <p className="text-xs text-muted-foreground/60 mt-2">{formatDate(notif.created_at)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )

      case 'favoritos':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold">Mis Favoritos</h2>
            {favorites.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No tienes productos favoritos aún.</p>
                <Link href="/catalogo"><Button className="bg-gold hover:bg-gold/90 text-background">Explorar Catálogo</Button></Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map(item => (
                  <div key={item.id} className="bg-card/50 border border-border rounded-2xl overflow-hidden hover:border-gold/30 transition-all group">
                    <Link href={`/producto/${item.slug || item.id}`}>
                      <div className="aspect-square relative bg-muted">
                        <Image src={item.images?.[0] || 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80'} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    </Link>
                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-1">{item.name}</h3>
                      <p className="text-gold font-bold mt-1">{formatPrice(item.price)}</p>
                      <div className="flex gap-2 mt-3">
                        <Button className="flex-1 bg-gold hover:bg-gold/90 text-background text-sm" onClick={() => { addItem(item as any, item.colors?.[0] || '', item.sizes?.[0] || '', 1); toast.success('Agregado al carrito') }}>
                          <ShoppingCart className="w-3 h-3 mr-1" /> Agregar
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-500/10" onClick={() => toggleFavorite(item)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )

      case 'direcciones':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Mis Direcciones</h2>
              <Button className="bg-gold hover:bg-gold/90 text-background" onClick={() => { setShowAddressForm(true); setEditingAddress(null); setAddressForm(emptyAddress) }}>
                <Plus className="w-4 h-4 mr-2" /> Agregar
              </Button>
            </div>
            <AnimatePresence>
              {showAddressForm && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="bg-card border border-gold/30 rounded-2xl p-6 space-y-4">
                  <h3 className="font-semibold">{editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-sm text-muted-foreground">Nombre completo</label><Input value={addressForm.full_name} onChange={e => setAddressForm(f => ({ ...f, full_name: e.target.value }))} /></div>
                    <div className="space-y-1"><label className="text-sm text-muted-foreground">Teléfono</label><Input value={addressForm.phone} onChange={e => setAddressForm(f => ({ ...f, phone: e.target.value }))} /></div>
                    <div className="space-y-1 md:col-span-2"><label className="text-sm text-muted-foreground">Dirección</label><Input value={addressForm.street} onChange={e => setAddressForm(f => ({ ...f, street: e.target.value }))} /></div>
                    <div className="space-y-1"><label className="text-sm text-muted-foreground">Ciudad</label><Input value={addressForm.city} onChange={e => setAddressForm(f => ({ ...f, city: e.target.value }))} /></div>
                    <div className="space-y-1"><label className="text-sm text-muted-foreground">Departamento</label><Input value={addressForm.state} onChange={e => setAddressForm(f => ({ ...f, state: e.target.value }))} /></div>
                    <div className="space-y-1"><label className="text-sm text-muted-foreground">País</label><Input value={addressForm.country} onChange={e => setAddressForm(f => ({ ...f, country: e.target.value }))} /></div>
                    <div className="space-y-1"><label className="text-sm text-muted-foreground">Código Postal</label><Input value={addressForm.postal_code} onChange={e => setAddressForm(f => ({ ...f, postal_code: e.target.value }))} /></div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleSaveAddress} className="bg-gold hover:bg-gold/90 text-background" disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}Guardar</Button>
                    <Button variant="ghost" onClick={() => { setShowAddressForm(false); setEditingAddress(null) }}>Cancelar</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {addresses.length === 0 && !showAddressForm ? (
              <div className="text-center py-16"><MapPin className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground">No tienes direcciones guardadas.</p></div>
            ) : (
              addresses.map(addr => (
                <div key={addr.id} className="bg-card/50 border border-border rounded-2xl p-6 hover:border-gold/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {addr.is_default && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold/20 text-gold text-xs rounded-full font-medium mb-2"><Check className="w-3 h-3" /> Principal</span>}
                      <p className="font-semibold">{addr.full_name}</p>
                      <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{addr.street}<br />{addr.city}, {addr.state}<br />{addr.country} {addr.postal_code}<br />Tel: {addr.phone}</p>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingAddress(addr); setAddressForm({ ...addr }); setShowAddressForm(true) }}><Edit2 className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/10" onClick={() => handleDeleteAddress(addr.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )

      case 'seguridad':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold">Seguridad</h2>
            <div className="bg-card/50 border border-border rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><Shield className="w-5 h-5 text-gold" /> Cambiar Contraseña</h3>
              <div className="space-y-3">
                <div className="space-y-1"><label className="text-sm text-muted-foreground">Nueva contraseña</label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="bg-card/50 border-border" /></div>
                <div className="space-y-1"><label className="text-sm text-muted-foreground">Confirmar contraseña</label><Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repite la nueva contraseña" className="bg-card/50 border-border" /></div>
                <Button className="bg-gold hover:bg-gold/90 text-background w-full" onClick={handleChangePassword} disabled={changingPassword || !newPassword || !confirmPassword}>
                  {changingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}Actualizar Contraseña
                </Button>
              </div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
              <h3 className="font-semibold text-red-400 mb-2">Zona de Peligro</h3>
              <p className="text-sm text-muted-foreground mb-4">Cierra sesión en todos los dispositivos.</p>
              <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
              </Button>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-10 h-10 animate-spin text-gold" />
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card/50 backdrop-blur border border-border rounded-3xl p-6 sticky top-24">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center overflow-hidden">
                      {userData.avatarUrl ? <Image src={userData.avatarUrl} alt="avatar" width={96} height={96} className="rounded-full object-cover" /> : <User className="w-12 h-12 text-gold" />}
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-gold rounded-full flex items-center justify-center text-background hover:bg-gold/90 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <h2 className="text-xl font-bold text-foreground mt-4">{userData.nombre} {userData.apellido}</h2>
                  <p className="text-sm text-muted-foreground">{userData.email}</p>
                  <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Crown className="w-3.5 h-3.5 text-gold" />
                    <span>{orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}</span>
                  </div>
                </div>
                <nav className="space-y-1">
                  {menuItems.map(item => (
                    <button key={item.id} onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === item.id ? 'bg-gold/20 text-gold' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}>
                      <item.icon className="w-5 h-5 shrink-0" />
                      <span className="font-medium text-sm">{item.label}</span>
                      {item.id === 'notificaciones' && unreadCount > 0 && (
                        <span className="ml-auto text-xs bg-gold text-background rounded-full px-2 py-0.5 font-bold">{unreadCount}</span>
                      )}
                      {item.id === 'pedidos' && orders.length > 0 && (
                        <span className="ml-auto text-xs bg-secondary text-muted-foreground rounded-full px-2 py-0.5">{orders.length}</span>
                      )}
                      {item.id !== 'notificaciones' && item.id !== 'pedidos' && (
                        <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${activeSection === item.id ? 'rotate-90' : ''}`} />
                      )}
                    </button>
                  ))}
                </nav>
                <div className="mt-6 pt-6 border-t border-border">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="bg-card/50 backdrop-blur border border-border rounded-3xl p-8">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
