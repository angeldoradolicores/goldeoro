'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Package, Heart, MapPin, Shield, LogOut, Camera, Save, X, Plus, Trash2,
  Check, Loader2, ShoppingCart, Truck, CheckCircle, Clock, XCircle,
  ExternalLink, MessageSquare, ChevronDown, DollarSign, Bell, Crown
} from 'lucide-react'
import SparklesUI from '@/components/sparkles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
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
  { key: 'pending', label: 'Pedido recibido', icon: Clock },
  { key: 'paid', label: 'Pago confirmado', icon: DollarSign },
  { key: 'processing', label: 'Preparando envío', icon: Package },
  { key: 'shipped', label: 'En camino', icon: Truck },
  { key: 'delivered', label: 'Entregado', icon: CheckCircle },
]

const STATUS_ORDER = ['pending', 'paid', 'processing', 'shipped', 'delivered']

function OrderTimeline({ status }: { status: string }) {
  const currentIdx = STATUS_ORDER.indexOf(status)
  const isCancelled = status === 'cancelled'
  return (
    <div className="relative my-8">
      {isCancelled ? (
        <div className="flex items-center gap-3 p-4 rounded-none bg-destructive/10 border border-destructive/20">
          <XCircle className="w-5 h-5 text-destructive shrink-0" />
          <p className="text-xs font-bold uppercase tracking-wider text-destructive">Pedido cancelado</p>
        </div>
      ) : (
        <div className="flex items-center justify-between relative px-2">
          {/* Progress line */}
          <div className="absolute top-4 left-4 right-4 h-[1px] bg-steel/30 z-0">
            <div
              className="h-full bg-chrome transition-all duration-700"
              style={{ width: currentIdx >= 0 ? `${(currentIdx / (ORDER_STEPS.length - 1)) * 100}%` : '0%' }}
            />
          </div>
          {ORDER_STEPS.map((step, i) => {
            const done = i <= currentIdx
            const active = i === currentIdx
            return (
              <div key={step.key} className="flex flex-col items-center gap-2.5 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${done ? 'bg-chrome text-obsidian shadow-lg shadow-chrome/15' : 'bg-graphite border border-steel/50 text-titanium'
                  } ${active ? 'ring-2 ring-chrome/40 scale-110' : ''}`}>
                  <step.icon className="w-3.5 h-3.5" />
                </div>
                <p className={`text-[9px] text-center font-medium tracking-wider uppercase leading-tight max-w-[65px] ${done ? 'text-white-diamond font-semibold' : 'text-titanium'}`}>
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
  id: string; full_name: string; street: string; city: string;
  state: string; country: string; postal_code: string; phone: string; is_default: boolean;
}

const emptyAddress: Omit<Address, 'id'> = {
  full_name: '', street: '', city: '', state: '', country: 'Colombia', postal_code: '', phone: '', is_default: false,
}

const menuItems = [
  { icon: User, label: 'Mis Datos', id: 'datos' },
  { icon: Package, label: 'Mis Pedidos', id: 'pedidos' },
  { icon: Bell, label: 'Notificaciones', id: 'notificaciones' },
  { icon: Heart, label: 'Favoritos', id: 'favoritos' },
  { icon: MapPin, label: 'Direcciones', id: 'direcciones' },
  { icon: Shield, label: 'Seguridad', id: 'seguridad' },
]

export default function PerfilClient({ initialUser, initialProfile, initialOrders, initialAddresses }: {
  initialUser: any
  initialProfile: any
  initialOrders: Order[]
  initialAddresses: Address[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const { addItem } = useCartStore()
  const { items: favorites, toggleFavorite, syncFavorites } = useFavoritesStore()

  const [activeSection, setActiveSection] = useState('datos')
  const [saving, setSaving] = useState(false)
  const [editingData, setEditingData] = useState(false)
  const userId = initialUser?.id
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const [userData, setUserData] = useState({
    nombre: initialProfile?.full_name?.split(' ')[0] || '',
    apellido: initialProfile?.full_name?.split(' ').slice(1).join(' ') || '',
    email: initialProfile?.email || initialUser?.email || '',
    telefono: initialProfile?.phone || '',
    fechaNacimiento: initialProfile?.birth_date || '',
    avatarUrl: initialProfile?.avatar_url || ''
  })
  const [editForm, setEditForm] = useState({ ...userData })
  const [notificationSettings, setNotificationSettings] = useState([
    { name: 'Recibir novedades y promociones', enabled: true },
    { name: 'Recibir notificaciones de pedido', enabled: true },
  ])

  const [orders, setOrders] = useState<Order[]>(initialOrders || [])
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses || [])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [addressForm, setAddressForm] = useState<Omit<Address, 'id'>>(emptyAddress)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    let mounted = true

    // Update global stores
    if (initialUser) {
      useAuthStore.getState().setUser(initialUser)
      useAuthStore.getState().setInitialized(true)
    }

    if (userId) {
      useCartStore.getState().syncCartFromServer().catch(e => console.warn('Cart sync:', e))
      useFavoritesStore.getState().syncFavoritesFromServer().catch(e => console.warn('Favorites sync:', e))
    } else {
      useCartStore.getState().hydrateCart()
      useFavoritesStore.getState().hydrateFavorites()
    }

    // Notifications can run on client side
    const fetchNotificationsAsync = async () => {
      try {
        const res = await fetch('/api/notifications')
        const data = await res.json()
        if (mounted && data.notifications) setNotifications(data.notifications)
      } catch (e) { console.error(e) }
    }
    fetchNotificationsAsync()

    const localSettings = typeof window !== 'undefined' ? window.localStorage.getItem(`profile-notifications-${userId}`) : null
    if (localSettings) {
      try {
        const parsed = JSON.parse(localSettings)
        setNotificationSettings(parsed)
      } catch {
        // ignore invalid localStorage
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (!mounted) return
      if (event === 'SIGNED_OUT') {
        router.push('/auth/login')
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [initialUser, supabase.auth, router, syncFavorites, userId])

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleLogout = async () => {
    await useAuthStore.getState().logout()
    router.refresh()
    await new Promise(resolve => setTimeout(resolve, 500))
    router.push('/')
  }

  const handleSaveProfile = async () => {
    if (!userId) return
    setSaving(true)
    const fullName = `${editForm.nombre} ${editForm.apellido}`.trim()

    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, phone: editForm.telefono, birthDate: editForm.fechaNacimiento || null }),
    })

    const data = await res.json()
    if (!res.ok || data.error) {
      toast.error(data.error || 'Error al guardar los datos')
    } else {
      setUserData({ ...editForm })
      setEditingData(false)
      toast.success('Datos guardados correctamente')
    }

    setSaving(false)
  }

  const handleToggleNotificationSetting = (index: number) => {
    setNotificationSettings(prev => {
      const updated = prev.map((item, i) => i === index ? { ...item, enabled: !item.enabled } : item)
      if (typeof window !== 'undefined' && userId) {
        window.localStorage.setItem(`profile-notifications-${userId}`, JSON.stringify(updated))
      }
      return updated
    })
  }

  const handleAvatarUpload = async (file: File) => {
    if (!userId) return
    setAvatarUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/profile/avatar', { method: 'POST', body: formData })
    const data = await res.json()

    if (res.ok && data.url) {
      setUserData(prev => ({ ...prev, avatarUrl: data.url }))
      setEditForm(prev => ({ ...prev }))
      toast.success('Foto de perfil actualizada')
    } else {
      toast.error(data.error || 'No se pudo subir la foto')
    }

    setAvatarUploading(false)
  }

  const triggerAvatarInput = () => {
    if (fileInputRef.current) fileInputRef.current.click()
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
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-steel/10">
              <h2 className="text-xl font-display font-semibold uppercase tracking-wider text-white-diamond">Mis Datos</h2>
              {!editingData ? (
                <Button variant="outline" size="sm" className="border-steel/50 text-chrome hover:border-chrome hover:text-chrome text-xs tracking-wider uppercase font-semibold rounded-none px-4 py-2" onClick={() => setEditingData(true)}>
                  Editar
                </Button>
              ) : (
                <div className="flex gap-4">
                  <Button variant="ghost" size="sm" className="text-chrome hover:text-white-diamond text-xs tracking-wider uppercase font-semibold rounded-none" onClick={() => { setEditingData(false); setEditForm({ ...userData }) }}>Cancelar</Button>
                  <Button size="sm" className="btn-luxury rounded-none text-xs uppercase tracking-wider font-semibold" onClick={handleSaveProfile} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1 text-obsidian" /> : null}Guardar
                  </Button>
                </div>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                ['Nombre', 'nombre', 'Tu nombre'],
                ['Apellido', 'apellido', 'Tu apellido']
              ].map(([label, key, placeholder]) => (
                <div key={key} className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">{label}</label>
                  <Input
                    value={editingData ? editForm[key as keyof typeof editForm] : userData[key as keyof typeof userData]}
                    readOnly={!editingData}
                    onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="h-12 bg-graphite border-steel/30 rounded-none text-white-diamond focus:border-chrome text-sm font-sans"
                  />
                </div>
              ))}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Email</label>
                <Input value={userData.email} readOnly className="h-12 bg-graphite border-steel/30 rounded-none text-titanium focus:border-steel/35 text-sm font-sans opacity-70" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Teléfono</label>
                <Input
                  value={editingData ? editForm.telefono : userData.telefono}
                  readOnly={!editingData}
                  onChange={e => setEditForm(f => ({ ...f, telefono: e.target.value }))}
                  placeholder="+57 300 000 0000"
                  className="h-12 bg-graphite border-steel/30 rounded-none text-white-diamond focus:border-chrome text-sm font-sans"
                />
              </div>
              <div className="space-y-4 md:col-span-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Notificaciones</p>
                <div className="grid gap-3">
                  {notificationSettings.map((setting, index) => (
                    <label key={setting.name} className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-steel/20">
                      <span className="text-sm text-white-diamond">{setting.name}</span>
                      <Switch checked={setting.enabled} onCheckedChange={() => handleToggleNotificationSetting(index)} />
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Fecha de Nacimiento</label>
                <Input
                  type="date"
                  value={editingData ? editForm.fechaNacimiento : userData.fechaNacimiento}
                  readOnly={!editingData}
                  onChange={e => setEditForm(f => ({ ...f, fechaNacimiento: e.target.value }))}
                  className="h-12 bg-graphite border-steel/30 rounded-none text-white-diamond focus:border-chrome text-sm font-sans"
                />
              </div>
            </div>
          </motion.div>
        )

      case 'pedidos':
        return (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-xl font-display font-semibold uppercase tracking-wider text-white-diamond pb-4 border-b border-steel/10">Mis Pedidos</h2>
            {orders.length === 0 ? (
              <div className="text-center py-20">
                <Package className="w-16 h-16 text-steel mx-auto mb-4" />
                <p className="text-titanium text-sm mb-6 font-light">Aún no tienes pedidos registrados.</p>
                <Link href="/catalogo"><Button className="btn-luxury rounded-none text-xs uppercase tracking-wider font-semibold">Ir al Catálogo</Button></Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map(order => (
                  <div key={order.id} className="bg-graphite/40 border border-steel/30 rounded-none overflow-hidden hover:border-chrome/20 transition-all duration-300 shadow-xl">
                    {/* Order Header */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="font-display font-semibold tracking-tight text-white-diamond">#{order.order_number}</p>
                          <p className="text-xs text-titanium mt-1 font-light">{formatDate(order.created_at)}</p>
                        </div>
                        <p className="text-base font-semibold text-chrome">{formatPrice(order.total)}</p>
                      </div>

                      {/* Timeline */}
                      <OrderTimeline status={order.status} />

                      {/* Tracking info */}
                      {order.tracking_number && (
                        <div className="mt-6 p-4 rounded-none bg-graphite border border-steel/30 space-y-3">
                          <div className="flex items-center gap-2 text-chrome font-semibold text-xs uppercase tracking-widest">
                            <Truck className="w-4 h-4" /> Información de Envío
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-xs font-light">
                            {order.carrier && <div><p className="text-titanium">Transportadora</p><p className="font-semibold text-white-diamond mt-0.5">{order.carrier}</p></div>}
                            <div><p className="text-titanium">Número de Guía</p><p className="font-mono font-semibold text-white-diamond mt-0.5">{order.tracking_number}</p></div>
                          </div>
                          {order.tracking_photo_url && (
                            <a href={order.tracking_photo_url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-chrome hover:underline mt-1">
                              <ExternalLink className="w-3.5 h-3.5" /> Ver foto de la guía
                            </a>
                          )}
                          {order.admin_note && (
                            <div className="flex items-start gap-2 mt-2 pt-2 border-t border-steel/10">
                              <MessageSquare className="w-3.5 h-3.5 text-chrome shrink-0 mt-0.5" />
                              <p className="text-xs text-titanium italic leading-relaxed">Nota: "{order.admin_note}"</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Expand toggle */}
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        className="mt-6 w-full flex items-center justify-center gap-2 text-[10px] font-semibold tracking-widest uppercase text-chrome hover:text-white-diamond transition-colors pt-4 border-t border-steel/20"
                      >
                        {expandedOrder === order.id ? <>Ocultar productos</> : <>Ver productos</>}
                      </button>
                    </div>

                    {/* Expanded items */}
                    <AnimatePresence>
                      {expandedOrder === order.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="border-t border-steel/20 bg-graphite/10 px-6 pb-6 pt-5 space-y-4 shadow-inner">
                          <p className="text-[10px] font-bold text-titanium uppercase tracking-wider">Detalles de Compra</p>
                          {order.items?.map((item, i) => (
                            <div key={i} className="flex justify-between items-center py-2 first:pt-0 border-b border-steel/5 last:border-b-0">
                              <div>
                                <p className="text-sm font-semibold text-white-diamond">{item.product_name}</p>
                                <p className="text-xs text-titanium mt-0.5 font-light">
                                  {[item.color && `Color: ${item.color}`, item.size && `Talla: ${item.size}`, `Cantidad: ${item.quantity}`].filter(Boolean).join(' · ')}
                                </p>
                              </div>
                              <p className="text-sm font-medium text-chrome">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                          ))}
                          <div className="pt-4 border-t border-steel/20 space-y-1.5 text-xs font-light">
                            <div className="flex justify-between text-titanium"><span>Subtotal</span><span className="text-white-diamond">{formatPrice(order.subtotal)}</span></div>
                            <div className="flex justify-between text-titanium"><span>Envío</span><span className="text-white-diamond">{formatPrice(order.shipping_cost)}</span></div>
                            <div className="flex justify-between font-semibold text-sm pt-2 border-t border-steel/10 text-white-diamond"><span>Total</span><span className="text-chrome font-bold">{formatPrice(order.total)}</span></div>
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
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-steel/10">
              <h2 className="text-xl font-display font-semibold uppercase tracking-wider text-white-diamond">Notificaciones</h2>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllRead} className="text-[10px] font-semibold text-titanium hover:text-white-diamond uppercase tracking-wider rounded-none">
                  Marcar todas como leídas
                </Button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="text-center py-20">
                <Bell className="w-16 h-16 text-steel mx-auto mb-4" />
                <p className="text-titanium text-sm font-light">No tienes notificaciones en tu bandeja.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map(notif => (
                  <motion.div key={notif.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className={`p-6 rounded-none border transition-colors ${notif.read ? 'bg-carbon/50 border-steel/20' : 'bg-carbon border-chrome/30 shadow-lg'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${notif.read ? 'bg-steel' : 'bg-chrome'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${notif.read ? 'text-titanium' : 'text-white-diamond'}`}>{notif.title}</p>
                        <p className="text-sm text-titanium mt-1 leading-relaxed font-light">{notif.message}</p>
                        <p className="text-[10px] text-steel mt-3 font-light tracking-wider">{formatDate(notif.created_at)}</p>
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
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-xl font-display font-semibold uppercase tracking-wider text-white-diamond pb-4 border-b border-steel/10">Mis Favoritos</h2>
            {favorites.length === 0 ? (
              <div className="text-center py-20">
                <Heart className="w-16 h-16 text-steel mx-auto mb-4" />
                <p className="text-titanium text-sm mb-6 font-light">No tienes productos en tu lista de deseos.</p>
                <Link href="/catalogo"><Button className="btn-luxury rounded-none text-xs uppercase tracking-wider font-semibold">Explorar Catálogo</Button></Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map(item => (
                  <div key={item.id} className="bg-graphite/40 border border-steel/30 rounded-none overflow-hidden hover:border-chrome/30 transition-all duration-350 group shadow-lg">
                    <Link href={`/producto/${item.slug || item.id}`}>
                      <div className="aspect-square relative bg-graphite">
                        <Image src={item.images?.[0] || 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80'} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    </Link>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm line-clamp-1 text-white-diamond">{item.name}</h3>
                      <p className="text-chrome font-semibold text-sm mt-1">{formatPrice(item.price)}</p>
                      <div className="flex gap-2 mt-4">
                        <Button className="flex-1 btn-luxury rounded-none text-xs font-semibold uppercase tracking-wider h-10" onClick={() => { addItem(item as any, item.colors?.[0] || '', item.sizes?.[0] || '', 1); toast.success('Agregado al carrito') }}>
                          <ShoppingCart className="w-3.5 h-3.5 mr-1 text-obsidian" /> Agregar
                        </Button>
                        <Button variant="outline" size="icon" className="border-steel/50 rounded-none text-destructive hover:bg-destructive/10 hover:border-destructive/30 w-10 h-10" onClick={() => toggleFavorite(item)}>
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
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-steel/10">
              <h2 className="text-xl font-display font-semibold uppercase tracking-wider text-white-diamond">Mis Direcciones</h2>
              <Button className="btn-luxury rounded-none text-xs uppercase font-semibold tracking-wider" onClick={() => { setShowAddressForm(true); setEditingAddress(null); setAddressForm(emptyAddress) }}>
                <Plus className="w-4 h-4 mr-2 text-obsidian" /> Agregar
              </Button>
            </div>
            <AnimatePresence>
              {showAddressForm && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="bg-graphite border border-steel/30 rounded-none p-6 space-y-4 shadow-xl">
                  <h3 className="font-display text-sm uppercase tracking-wider text-white-diamond">{editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Nombre completo</label><Input className="bg-carbon border-steel/30 rounded-none focus:border-chrome text-white-diamond text-sm font-sans" value={addressForm.full_name} onChange={e => setAddressForm(f => ({ ...f, full_name: e.target.value }))} /></div>
                    <div className="space-y-1"><label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Teléfono</label><Input className="bg-carbon border-steel/30 rounded-none focus:border-chrome text-white-diamond text-sm font-sans" value={addressForm.phone} onChange={e => setAddressForm(f => ({ ...f, phone: e.target.value }))} /></div>
                    <div className="space-y-1 md:col-span-2"><label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Dirección</label><Input className="bg-carbon border-steel/30 rounded-none focus:border-chrome text-white-diamond text-sm font-sans" value={addressForm.street} onChange={e => setAddressForm(f => ({ ...f, street: e.target.value }))} /></div>
                    <div className="space-y-1"><label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Ciudad</label><Input className="bg-carbon border-steel/30 rounded-none focus:border-chrome text-white-diamond text-sm font-sans" value={addressForm.city} onChange={e => setAddressForm(f => ({ ...f, city: e.target.value }))} /></div>
                    <div className="space-y-1"><label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Departamento</label><Input className="bg-carbon border-steel/30 rounded-none focus:border-chrome text-white-diamond text-sm font-sans" value={addressForm.state} onChange={e => setAddressForm(f => ({ ...f, state: e.target.value }))} /></div>
                    <div className="space-y-1"><label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">País</label><Input className="bg-carbon border-steel/30 rounded-none focus:border-chrome text-white-diamond text-sm font-sans" value={addressForm.country} onChange={e => setAddressForm(f => ({ ...f, country: e.target.value }))} /></div>
                    <div className="space-y-1"><label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Código Postal</label><Input className="bg-carbon border-steel/30 rounded-none focus:border-chrome text-white-diamond text-sm font-sans" value={addressForm.postal_code} onChange={e => setAddressForm(f => ({ ...f, postal_code: e.target.value }))} /></div>
                  </div>
                  <div className="flex gap-4 pt-2">
                    <Button onClick={handleSaveAddress} className="btn-luxury rounded-none text-xs uppercase tracking-wider font-semibold" disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin mr-1 text-obsidian" /> : null}Guardar</Button>
                    <Button variant="ghost" className="text-chrome hover:text-white-diamond text-xs uppercase tracking-wider" onClick={() => { setShowAddressForm(false); setEditingAddress(null) }}>Cancelar</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {addresses.length === 0 && !showAddressForm ? (
              <div className="text-center py-20"><MapPin className="w-16 h-16 text-steel mx-auto mb-4" /><p className="text-titanium text-sm font-light">No tienes direcciones registradas en tu libreta.</p></div>
            ) : (
              <div className="space-y-4">
                {addresses.map(addr => (
                  <div key={addr.id} className="bg-graphite/40 border border-steel/30 rounded-none p-6 hover:border-chrome/30 transition-colors shadow-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {addr.is_default && <span className="inline-flex items-center gap-1 px-3 py-1 bg-chrome/10 border border-chrome/30 text-chrome text-[9px] uppercase tracking-wider rounded-none font-semibold mb-3"><Check className="w-3 h-3" /> Principal</span>}
                        <p className="font-semibold text-white-diamond">{addr.full_name}</p>
                        <p className="text-titanium mt-2 text-xs md:text-sm leading-relaxed font-sans font-light">{addr.street}<br />{addr.city}, {addr.state}<br />{addr.country} {addr.postal_code}<br />Tel: {addr.phone}</p>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button variant="ghost" size="sm" className="text-chrome hover:text-white-diamond hover:bg-graphite border border-transparent hover:border-steel/30 rounded-none" onClick={() => { setEditingAddress(addr); setAddressForm({ ...addr }); setShowAddressForm(true) }}><User className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 rounded-none" onClick={() => handleDeleteAddress(addr.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )

      case 'seguridad':
        return (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-xl font-display font-semibold uppercase tracking-wider text-white-diamond pb-4 border-b border-steel/10">Seguridad</h2>
            <div className="bg-graphite/40 border border-steel/30 p-6 rounded-none space-y-6 shadow-xl">
              <h3 className="font-display text-sm uppercase tracking-wider text-white-diamond flex items-center gap-2 border-b border-steel/10 pb-3"><Shield className="w-4 h-4 text-chrome" /> Cambiar Contraseña</h3>
              <div className="space-y-4">
                <div className="space-y-2"><label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Nueva contraseña</label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="bg-carbon border-steel/30 rounded-none focus:border-chrome text-white-diamond text-sm font-sans" /></div>
                <div className="space-y-2"><label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Confirmar contraseña</label><Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repite la nueva contraseña" className="bg-carbon border-steel/30 rounded-none focus:border-chrome text-white-diamond text-sm font-sans" /></div>
                <Button className="w-full btn-luxury rounded-none text-xs uppercase tracking-wider font-semibold py-4" onClick={handleChangePassword} disabled={changingPassword || !newPassword || !confirmPassword}>
                  {changingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2 text-obsidian animate-spin" /> : null}Actualizar Contraseña
                </Button>
              </div>
            </div>
            <div className="border border-destructive/20 bg-destructive/5 rounded-none p-6 shadow-xl">
              <h3 className="font-display text-sm uppercase tracking-wider text-destructive mb-2">Zona de Peligro</h3>
              <p className="text-titanium text-xs font-light mb-4">Cierra tu sesión activa en este y otros dispositivos conectados.</p>
              <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 rounded-none text-xs uppercase tracking-wider font-semibold py-4 px-6" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
              </Button>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-obsidian text-foreground">
      <Navbar />
      <SparklesUI extra={2} />
      <main className="pt-36 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-carbon border border-steel/30 p-6 sticky top-32 rounded-none shadow-2xl space-y-6">
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-24 h-24 rounded-none border border-steel/30 bg-graphite flex items-center justify-center overflow-hidden">
                      {userData.avatarUrl ? <Image src={userData.avatarUrl} alt="avatar" width={96} height={96} className="object-cover" /> : <User className="w-12 h-12 text-chrome" />}
                    </div>
                    <button type="button" onClick={triggerAvatarInput} className="absolute bottom-0 right-0 w-8 h-8 bg-chrome flex items-center justify-center text-obsidian hover:bg-chrome/90 transition-colors">
                      {avatarUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (event) => {
                        const file = event.target.files?.[0]
                        if (file) await handleAvatarUpload(file)
                        event.target.value = ''
                      }}
                    />
                  </div>
                  <h2 className="text-lg font-display font-semibold text-white-diamond">{userData.nombre} {userData.apellido}</h2>
                  <p className="text-xs text-titanium mt-1 font-light break-all">{userData.email}</p>
                  <div className="flex items-center justify-center gap-2 mt-4 text-[10px] uppercase tracking-wider text-chrome font-sans font-medium bg-graphite/40 py-1.5 px-3 border border-steel/20">
                    <Crown className="w-3.5 h-3.5" />
                    <span>{orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}</span>
                  </div>
                </div>
                <nav className="space-y-1">
                  {menuItems.map(item => (
                    <button key={item.id} onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-none transition-all ${activeSection === item.id
                          ? 'bg-chrome text-obsidian font-semibold'
                          : 'text-chrome hover:bg-graphite hover:text-white-diamond'
                        }`}>
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="font-semibold text-xs uppercase tracking-wider">{item.label}</span>
                      {item.id === 'notificaciones' && unreadCount > 0 && (
                        <span className="ml-auto text-[10px] bg-white-diamond text-obsidian rounded-full w-5 h-5 flex items-center justify-center font-bold">{unreadCount}</span>
                      )}
                      {item.id === 'pedidos' && orders.length > 0 && (
                        <span className="ml-auto text-[10px] bg-steel text-white-diamond rounded-full w-5 h-5 flex items-center justify-center font-semibold">{orders.length}</span>
                      )}
                    </button>
                  ))}
                </nav>
                <div className="pt-6 border-t border-steel/20">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-none text-destructive hover:bg-destructive/5 border border-transparent hover:border-destructive/20 transition-all font-semibold text-xs uppercase tracking-wider">
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="bg-carbon border border-steel/30 rounded-none p-6 sm:p-8 shadow-2xl relative">
                <div className="reflect-shimmer" />
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
