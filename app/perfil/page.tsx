'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Package, Heart, MapPin, CreditCard, Bell, Shield,
  LogOut, ChevronRight, Edit2, Camera, Crown, Save, X, Plus, Trash2, Check, Loader2, ShoppingCart
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

const menuItems = [
  { icon: User, label: 'Mis Datos', id: 'datos' },
  { icon: Package, label: 'Mis Pedidos', id: 'pedidos' },
  { icon: Heart, label: 'Favoritos', id: 'favoritos' },
  { icon: MapPin, label: 'Direcciones', id: 'direcciones' },
  { icon: CreditCard, label: 'Métodos de Pago', id: 'pagos' },
  { icon: Bell, label: 'Notificaciones', id: 'notificaciones' },
  { icon: Shield, label: 'Seguridad', id: 'seguridad' },
]

interface Address {
  id: string
  full_name: string
  street: string
  city: string
  state: string
  country: string
  postal_code: string
  phone: string
  is_default: boolean
}

const emptyAddress: Omit<Address, 'id'> = {
  full_name: '',
  street: '',
  city: '',
  state: '',
  country: 'Colombia',
  postal_code: '',
  phone: '',
  is_default: false,
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price)
}

export default function PerfilPage() {
  const router = useRouter()
  const supabase = createClient()
  const { clearCart, addItem } = useCartStore()
  const { items: favorites, toggleFavorite, syncFavorites, clearFavorites } = useFavoritesStore()

  const [activeSection, setActiveSection] = useState('datos')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingData, setEditingData] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [userData, setUserData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    avatarUrl: '',
  })
  const [editForm, setEditForm] = useState({ ...userData })

  const [orders, setOrders] = useState<any[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [addressForm, setAddressForm] = useState<Omit<Address, 'id'>>(emptyAddress)

  // Security state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    const fetchProfileData = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/auth/login')
        return
      }

      setUserId(session.user.id)

      // Load cart for this user from Supabase
      useCartStore.getState().syncCart()

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()

      if (profile) {
        const nameParts = profile.full_name ? profile.full_name.split(' ') : ['']
        const data = {
          nombre: nameParts[0] || '',
          apellido: nameParts.slice(1).join(' ') || '',
          email: profile.email || session.user.email || '',
          telefono: profile.phone || '',
          fechaNacimiento: profile.birth_date || '',
          avatarUrl: profile.avatar_url || '',
        }
        setUserData(data)
        setEditForm(data)
      } else {
        const data = {
          nombre: '',
          apellido: '',
          email: session.user.email || '',
          telefono: '',
          fechaNacimiento: '',
          avatarUrl: '',
        }
        setUserData(data)
        setEditForm(data)
      }

      // Fetch orders
      const { data: userOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (userOrders) setOrders(userOrders)

      // Fetch addresses
      const { data: userAddresses } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', session.user.id)
        .order('is_default', { ascending: false })

      if (userAddresses) setAddresses(userAddresses as Address[])

      // Sync favorites
      await syncFavorites()

      setLoading(false)
    }

    fetchProfileData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogout = async () => {
    await useAuthStore.getState().logout()
    router.push('/')
  }

  const handleSaveProfile = async () => {
    if (!userId) return
    setSaving(true)
    const fullName = `${editForm.nombre} ${editForm.apellido}`.trim()
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone: editForm.telefono,
        birth_date: editForm.fechaNacimiento || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      toast.error('Error al guardar los datos')
    } else {
      setUserData({ ...editForm })
      setEditingData(false)
      toast.success('Datos guardados correctamente')
    }
    setSaving(false)
  }

  const handleSaveAddress = async () => {
    if (!userId) return
    setSaving(true)

    if (editingAddress) {
      const { error } = await supabase
        .from('addresses')
        .update(addressForm)
        .eq('id', editingAddress.id)

      if (!error) {
        setAddresses(prev => prev.map(a => a.id === editingAddress.id ? { ...addressForm, id: editingAddress.id } : a))
        toast.success('Dirección actualizada')
      } else {
        toast.error('Error al actualizar la dirección')
      }
    } else {
      const { data, error } = await supabase
        .from('addresses')
        .insert({ ...addressForm, user_id: userId })
        .select()
        .single()

      if (!error && data) {
        setAddresses(prev => [...prev, data as Address])
        toast.success('Dirección agregada')
      } else {
        toast.error('Error al agregar la dirección')
      }
    }

    setShowAddressForm(false)
    setEditingAddress(null)
    setAddressForm(emptyAddress)
    setSaving(false)
  }

  const handleDeleteAddress = async (id: string) => {
    const { error } = await supabase.from('addresses').delete().eq('id', id)
    if (!error) {
      setAddresses(prev => prev.filter(a => a.id !== id))
      toast.success('Dirección eliminada')
    }
  }

  const handleSetDefaultAddress = async (id: string) => {
    if (!userId) return
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId)
    await supabase.from('addresses').update({ is_default: true }).eq('id', id)
    setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })))
    toast.success('Dirección principal actualizada')
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setChangingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      toast.error('Error al cambiar la contraseña')
    } else {
      toast.success('Contraseña actualizada correctamente')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setChangingPassword(false)
  }

  const handleFinalizeOrder = async (orderId: string) => {
    const { error } = await supabase.from('orders').update({ status: 'completed' }).eq('id', orderId)
    if (!error) {
      toast.success('Pedido finalizado')
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed' } : o))
    } else {
      toast.error('Error al finalizar el pedido')
    }
  }

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered': return 'Entregado'
      case 'completed': return 'Completado'
      case 'shipped': return 'En camino'
      case 'processing': return 'Procesando'
      case 'cancelled': return 'Cancelado'
      default: return 'Pendiente'
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'completed': return 'bg-green-500/20 text-green-400'
      case 'shipped': return 'bg-blue-500/20 text-blue-400'
      case 'cancelled': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gold/20 text-gold'
    }
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
                  <Button variant="ghost" size="sm" onClick={() => { setEditingData(false); setEditForm({ ...userData }) }}>
                    <X className="w-4 h-4 mr-1" /> Cancelar
                  </Button>
                  <Button size="sm" className="bg-gold hover:bg-gold/90 text-background" onClick={handleSaveProfile} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                    Guardar
                  </Button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Nombre</label>
                <Input
                  value={editingData ? editForm.nombre : userData.nombre}
                  readOnly={!editingData}
                  onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))}
                  className="bg-card/50 border-border"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Apellido</label>
                <Input
                  value={editingData ? editForm.apellido : userData.apellido}
                  readOnly={!editingData}
                  onChange={e => setEditForm(f => ({ ...f, apellido: e.target.value }))}
                  className="bg-card/50 border-border"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Email</label>
                <Input value={userData.email} readOnly className="bg-card/50 border-border opacity-70" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Teléfono</label>
                <Input
                  value={editingData ? editForm.telefono : userData.telefono}
                  readOnly={!editingData}
                  onChange={e => setEditForm(f => ({ ...f, telefono: e.target.value }))}
                  className="bg-card/50 border-border"
                  placeholder={editingData ? '+57 300 000 0000' : ''}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm text-muted-foreground">Fecha de Nacimiento</label>
                <Input
                  type="date"
                  value={editingData ? editForm.fechaNacimiento : userData.fechaNacimiento}
                  readOnly={!editingData}
                  onChange={e => setEditForm(f => ({ ...f, fechaNacimiento: e.target.value }))}
                  className="bg-card/50 border-border"
                />
              </div>
            </div>
          </motion.div>
        )

      case 'pedidos':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold">Mis Pedidos</h2>
            {orders.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Aún no tienes pedidos.</p>
                <Link href="/catalogo">
                  <Button className="bg-gold hover:bg-gold/90 text-background">Ir al Catálogo</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-card/50 border border-border rounded-2xl p-6 hover:border-gold/30 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-foreground">#{order.order_number || order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString('es-CO')}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-gold">{formatPrice(order.total || 0)}</p>
                    </div>
                    {(order.status === 'pending' || order.status === 'processing') && (
                      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                        <Link href="/checkout">
                          <Button variant="outline" size="sm" className="border-gold/30 hover:bg-gold/10">
                            <Edit2 className="w-3 h-3 mr-1" /> Editar
                          </Button>
                        </Link>
                        <Button size="sm" className="bg-gold hover:bg-gold/90 text-background" onClick={() => handleFinalizeOrder(order.id)}>
                          <Check className="w-3 h-3 mr-1" /> Finalizar
                        </Button>
                      </div>
                    )}
                  </div>
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
                <Link href="/catalogo">
                  <Button className="bg-gold hover:bg-gold/90 text-background">Explorar Catálogo</Button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map(item => (
                  <div key={item.id} className="bg-card/50 border border-border rounded-2xl overflow-hidden hover:border-gold/30 transition-all group">
                    <Link href={`/producto/${item.slug || item.id}`}>
                      <div className="aspect-square relative bg-muted">
                        <Image
                          src={item.images?.[0] || 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80'}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </Link>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground line-clamp-1">{item.name}</h3>
                      <p className="text-gold font-bold mt-1">{formatPrice(item.price)}</p>
                      <div className="flex gap-2 mt-3">
                        <Button
                          className="flex-1 bg-gold hover:bg-gold/90 text-background text-sm"
                          onClick={() => {
                            addItem(item as any, item.colors?.[0] || '', item.sizes?.[0] || '', 1)
                            toast.success('Agregado al carrito')
                          }}
                        >
                          <ShoppingCart className="w-3 h-3 mr-1" /> Agregar
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:bg-red-500/10"
                          onClick={() => toggleFavorite(item)}
                        >
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
              <Button
                className="bg-gold hover:bg-gold/90 text-background"
                onClick={() => { setShowAddressForm(true); setEditingAddress(null); setAddressForm(emptyAddress) }}
              >
                <Plus className="w-4 h-4 mr-2" /> Agregar
              </Button>
            </div>

            <AnimatePresence>
              {showAddressForm && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-card border border-gold/30 rounded-2xl p-6 space-y-4"
                >
                  <h3 className="font-semibold">{editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm text-muted-foreground">Nombre completo</label>
                      <Input value={addressForm.full_name} onChange={e => setAddressForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Nombre del destinatario" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-muted-foreground">Teléfono</label>
                      <Input value={addressForm.phone} onChange={e => setAddressForm(f => ({ ...f, phone: e.target.value }))} placeholder="+57 300 000 0000" />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-sm text-muted-foreground">Dirección</label>
                      <Input value={addressForm.street} onChange={e => setAddressForm(f => ({ ...f, street: e.target.value }))} placeholder="Calle, número, barrio" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-muted-foreground">Ciudad</label>
                      <Input value={addressForm.city} onChange={e => setAddressForm(f => ({ ...f, city: e.target.value }))} placeholder="Medellín" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-muted-foreground">Departamento</label>
                      <Input value={addressForm.state} onChange={e => setAddressForm(f => ({ ...f, state: e.target.value }))} placeholder="Antioquia" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-muted-foreground">País</label>
                      <Input value={addressForm.country} onChange={e => setAddressForm(f => ({ ...f, country: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-muted-foreground">Código Postal</label>
                      <Input value={addressForm.postal_code} onChange={e => setAddressForm(f => ({ ...f, postal_code: e.target.value }))} placeholder="050001" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button onClick={handleSaveAddress} className="bg-gold hover:bg-gold/90 text-background" disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                      Guardar
                    </Button>
                    <Button variant="ghost" onClick={() => { setShowAddressForm(false); setEditingAddress(null) }}>Cancelar</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {addresses.length === 0 && !showAddressForm ? (
              <div className="text-center py-16">
                <MapPin className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No tienes direcciones guardadas.</p>
              </div>
            ) : (
              addresses.map(addr => (
                <div key={addr.id} className="bg-card/50 border border-border rounded-2xl p-6 hover:border-gold/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {addr.is_default && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold/20 text-gold text-xs rounded-full font-medium mb-2">
                          <Check className="w-3 h-3" /> Principal
                        </span>
                      )}
                      <p className="font-semibold text-foreground">{addr.full_name}</p>
                      <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                        {addr.street}<br />
                        {addr.city}, {addr.state}<br />
                        {addr.country} {addr.postal_code}<br />
                        Tel: {addr.phone}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingAddress(addr); setAddressForm({ ...addr }); setShowAddressForm(true) }}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      {!addr.is_default && (
                        <Button variant="ghost" size="sm" className="text-gold hover:bg-gold/10" onClick={() => handleSetDefaultAddress(addr.id)}>
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/10" onClick={() => handleDeleteAddress(addr.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )

      case 'pagos':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold">Métodos de Pago</h2>
            <div className="bg-card/50 border border-gold/20 rounded-2xl p-8 text-center">
              <CreditCard className="w-16 h-16 text-gold/40 mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No hay métodos de pago guardados.</p>
              <p className="text-sm text-muted-foreground mb-6">Los pagos se procesan de forma segura en el momento del checkout.</p>
              <div className="flex justify-center gap-3">
                <div className="px-4 py-2 bg-muted rounded-lg text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</span>
                  Visa
                </div>
                <div className="px-4 py-2 bg-muted rounded-lg text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">MC</span>
                  Mastercard
                </div>
                <div className="px-4 py-2 bg-muted rounded-lg text-sm text-muted-foreground">
                  PSE
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 'notificaciones':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold">Notificaciones</h2>
            <div className="space-y-3">
              {[
                { label: 'Actualizaciones de pedidos', desc: 'Recibe notificaciones sobre el estado de tus pedidos', enabled: true },
                { label: 'Nuevos productos', desc: 'Entérate cuando lleguen nuevas gorras al catálogo', enabled: false },
                { label: 'Promociones y descuentos', desc: 'Ofertas exclusivas y descuentos especiales', enabled: true },
                { label: 'Recordatorios de carrito', desc: 'Te recordamos cuando tienes productos en el carrito', enabled: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-card/50 border border-border rounded-xl p-4">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <button
                    className={`relative w-12 h-6 rounded-full transition-colors ${item.enabled ? 'bg-gold' : 'bg-muted'}`}
                    aria-label={`Toggle ${item.label}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${item.enabled ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )

      case 'seguridad':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold">Seguridad</h2>
            <div className="bg-card/50 border border-border rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5 text-gold" /> Cambiar Contraseña
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Nueva contraseña</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="bg-card/50 border-border"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Confirmar contraseña</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    className="bg-card/50 border-border"
                  />
                </div>
                <Button
                  className="bg-gold hover:bg-gold/90 text-background w-full"
                  onClick={handleChangePassword}
                  disabled={changingPassword || !newPassword || !confirmPassword}
                >
                  {changingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Actualizar Contraseña
                </Button>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
              <h3 className="font-semibold text-red-400 mb-2">Zona de Peligro</h3>
              <p className="text-sm text-muted-foreground mb-4">Cierra sesión en todos los dispositivos o elimina tu cuenta.</p>
              <Button
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
              </Button>
            </div>
          </motion.div>
        )

      default:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16">
            <Crown className="w-16 h-16 text-gold/30 mb-4" />
            <p className="text-muted-foreground">Sección en construcción</p>
          </motion.div>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card/50 backdrop-blur border border-border rounded-3xl p-6 sticky top-24">
                {/* Profile Header */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center overflow-hidden">
                      {userData.avatarUrl ? (
                        <Image src={userData.avatarUrl} alt="avatar" width={96} height={96} className="rounded-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-gold" />
                      )}
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-gold rounded-full flex items-center justify-center text-background hover:bg-gold/90 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <h2 className="text-xl font-bold text-foreground mt-4">
                    {userData.nombre} {userData.apellido}
                  </h2>
                  <p className="text-sm text-muted-foreground">{userData.email}</p>
                </div>

                {/* Menu */}
                <nav className="space-y-1">
                  {menuItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        activeSection === item.id
                          ? 'bg-gold/20 text-gold'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      }`}
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      <span className="font-medium text-sm">{item.label}</span>
                      {item.id === 'favoritos' && favorites.length > 0 && (
                        <span className="ml-auto text-xs bg-gold/20 text-gold rounded-full px-2 py-0.5">{favorites.length}</span>
                      )}
                      {item.id === 'pedidos' && orders.filter(o => o.status === 'pending' || o.status === 'processing').length > 0 && (
                        <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 rounded-full px-2 py-0.5">
                          {orders.filter(o => o.status === 'pending' || o.status === 'processing').length}
                        </span>
                      )}
                      {item.id !== 'favoritos' && item.id !== 'pedidos' && (
                        <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${activeSection === item.id ? 'rotate-90' : ''}`} />
                      )}
                    </button>
                  ))}
                </nav>

                <div className="mt-6 pt-6 border-t border-border">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
                  >
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
