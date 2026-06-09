'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, Eye, Package, Truck, CheckCircle, Clock, XCircle,
  Loader2, ChevronDown, ExternalLink, DollarSign, Send, X, Camera,
  MessageSquare, Hash, Building2, AlertCircle, Bell, ArrowLeft,
  ChevronRight, ShoppingBag, Heart, Shield, LogOut, Calendar, Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'

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

const STATUS_ORDER = ['pending', 'paid', 'processing', 'shipped', 'delivered']

function OrderTimeline({ status }: { status: string }) {
  const currentIdx = STATUS_ORDER.indexOf(status)
  const isCancelled = status === 'cancelled'
  return (
    <div className="relative my-6">
      {isCancelled ? (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
          <XCircle className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
          <div>
            <p className="text-sm font-bold text-red-400">Pedido cancelado</p>
            <p className="text-xs text-red-400/80 mt-0.5">Ponte en contacto con soporte si tienes dudas sobre tu reembolso.</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between relative px-2">
          {/* Progress Line */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-border z-0">
            <div
              className="h-full bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-green transition-all duration-1000"
              style={{ width: currentIdx >= 0 ? `${(currentIdx / (ORDER_STEPS.length - 1)) * 100}%` : '0%' }}
            />
          </div>
          {ORDER_STEPS.map((step, i) => {
            const done = i <= currentIdx
            const active = i === currentIdx
            return (
              <div key={step.key} className="flex flex-col items-center gap-2 z-10">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  done ? 'bg-gradient-to-r from-neon-pink to-neon-cyan text-white shadow-lg shadow-neon-pink/20' : 'bg-secondary text-muted-foreground'
                } ${active ? 'ring-4 ring-neon-cyan/40 scale-110' : ''}`}>
                  <step.icon className="w-4 h-4" />
                </div>
                <p className={`text-[10px] sm:text-xs text-center font-bold tracking-wide leading-tight max-w-[70px] ${
                  active ? 'text-neon-cyan font-extrabold' : done ? 'text-foreground/90' : 'text-muted-foreground'
                }`}>
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
  total: number
  subtotal: number
  shipping_cost: number
  tracking_number?: string
  carrier?: string
  tracking_photo_url?: string
  admin_note?: string
  shipped_at?: string
  delivered_at?: string
  shipping_address?: {
    name: string
    phone: string
    email: string
    address: string
    city: string
    state: string
    postal_code?: string
  }
  items?: OrderItem[]
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  created_at: string
}

function OrdersContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  // Track Params from Email
  const paramOrderNumber = searchParams.get('order_number')
  const paramEmail = searchParams.get('email')

  // Auth State
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Logged-in state
  const [orders, setOrders] = useState<Order[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'pedidos' | 'notificaciones'>('pedidos')
  
  // Guest Tracking State
  const [trackOrderNumber, setTrackOrderNumber] = useState('')
  const [trackEmail, setTrackEmail] = useState('')
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null)
  const [trackLoading, setTrackLoading] = useState(false)
  const [trackError, setTrackError] = useState('')

  const fetchOrders = async (uid: string) => {
    const { data: userOrders } = await supabase
      .from('orders')
      .select('id, order_number, created_at, status, total, subtotal, shipping_cost, tracking_number, carrier, tracking_photo_url, admin_note, shipped_at, items:order_items(*)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
    if (userOrders) setOrders(userOrders as Order[])
  }

  const fetchNotifications = async () => {
    try {
      const notifRes = await fetch('/api/notifications')
      const notifData = await notifRes.json()
      if (notifData.notifications) setNotifications(notifData.notifications)
    } catch (e) {
      console.error(e)
    }
  }

  // Load Auth Session & Realtime Subscriptions
  useEffect(() => {
    let ordersChannel: any = null

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await fetchOrders(session.user.id)
        await fetchNotifications()

        // Set up real-time subscription for logged-in user
        ordersChannel = supabase
          .channel(`user-updates-${session.user.id}`)
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${session.user.id}` },
            async (payload: any) => {
              console.log('Order changed in real-time:', payload)
              await fetchOrders(session.user.id)
              toast.info(`Pedido #${payload.new.order_number} actualizado a: ${payload.new.status}`)
            }
          )
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${session.user.id}` },
            async (payload: any) => {
              console.log('New notification in real-time:', payload)
              await fetchNotifications()
              toast.info(`Nueva notificación: ${payload.new.title}`)
            }
          )
          .subscribe()
      }
      setAuthLoading(false)
    }

    checkAuth()

    return () => {
      if (ordersChannel) {
        supabase.removeChannel(ordersChannel)
      }
    }
  }, [])

  // Guest Realtime Subscription
  useEffect(() => {
    if (!trackedOrder) return

    const guestChannel = supabase
      .channel(`guest-order-${trackedOrder.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${trackedOrder.id}` },
        (payload: any) => {
          console.log('Tracked guest order updated:', payload)
          setTrackedOrder(prev => prev ? { ...prev, ...payload.new } : null)
          toast.info(`Tu pedido #${payload.new.order_number} ha sido actualizado a: ${payload.new.status}`)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(guestChannel)
    }
  }, [trackedOrder?.id])

  // Auto Lookup if Params exist
  useEffect(() => {
    if (paramOrderNumber && paramEmail) {
      handleTrackQuery(paramOrderNumber, paramEmail)
    }
  }, [paramOrderNumber, paramEmail])

  const handleTrackQuery = async (orderNum: string, emailStr: string) => {
    setTrackLoading(true)
    setTrackError('')
    try {
      const res = await fetch(`/api/orders/track?order_number=${encodeURIComponent(orderNum)}&email=${encodeURIComponent(emailStr)}`)
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'No se encontró el pedido o los datos no coinciden.')
      }
      if (data.order) {
        setTrackedOrder(data.order)
      } else {
        throw new Error('Pedido no encontrado.')
      }
    } catch (err: any) {
      setTrackError(err.message || 'Error al buscar el pedido.')
      setTrackedOrder(null)
    } finally {
      setTrackLoading(false)
    }
  }

  const handleTrackFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackOrderNumber || !trackEmail) {
      toast.error('Por favor ingresa todos los campos')
      return
    }
    handleTrackQuery(trackOrderNumber, trackEmail)
  }

  const markAllNotificationsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true })
      })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast.success('Notificaciones leídas')
    } catch (e) {
      console.error(e)
    }
  }

  const unreadNotifsCount = notifications.filter(n => !n.read).length

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-neon-pink mb-4" />
        <p className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">Cargando tus pedidos...</p>
      </div>
    )
  }

  // Logged In Customer Orders View
  if (user) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gradient-neon tracking-tight uppercase">Mis Pedidos</h1>
            <p className="text-muted-foreground mt-1">Historial completo, estado de envío y actualizaciones en tiempo real.</p>
          </div>
          <div className="flex bg-card/60 p-1 rounded-2xl border border-border/40 gap-1 self-stretch md:self-auto">
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide uppercase transition-all flex items-center justify-center gap-2 ${
                activeTab === 'pedidos' ? 'bg-gradient-neon text-background' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Package className="w-4 h-4" />
              Pedidos ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('notificaciones')}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide uppercase transition-all flex items-center justify-center gap-2 ${
                activeTab === 'notificaciones' ? 'bg-gradient-neon text-background' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Bell className="w-4 h-4" />
              Avisos
              {unreadNotifsCount > 0 && (
                <span className="w-5 h-5 bg-neon-pink text-white rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse">
                  {unreadNotifsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {activeTab === 'pedidos' ? (
          orders.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-card/30 border border-border/40 rounded-3xl p-8 backdrop-blur-md">
              <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Aún no tienes pedidos</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6">Explora nuestra colección luxury streetwear y estrena hoy mismo.</p>
              <Link href="/catalogo">
                <Button className="btn-luxury py-5 px-8 font-black uppercase tracking-widest text-xs">
                  Explorar Catálogo
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, idx) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-card/40 backdrop-blur-md border border-border/40 rounded-3xl overflow-hidden hover:border-neon-cyan/20 transition-all duration-300 shadow-xl"
                >
                  {/* Order Header */}
                  <div className="p-6 sm:p-8 border-b border-border/20">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-widest text-neon-pink">Número de Pedido</span>
                          <span className="text-[10px] tracking-[0.2em] uppercase bg-secondary text-muted-foreground px-2 py-0.5 rounded font-semibold">
                            {order.status === 'paid' ? 'Pagado' : order.status === 'pending' ? 'Pendiente' : order.status === 'processing' ? 'Procesando' : order.status === 'shipped' ? 'En camino' : order.status === 'delivered' ? 'Entregado' : 'Cancelado'}
                          </span>
                        </div>
                        <h3 className="text-xl font-mono font-black tracking-tight text-white">#{order.order_number}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Monto Total</p>
                        <p className="text-2xl font-black text-neon-green mt-0.5">{formatPrice(order.total)}</p>
                      </div>
                    </div>

                    {/* Timeline */}
                    <OrderTimeline status={order.status} />

                    {/* Tracking details if available */}
                    {order.tracking_number && (
                      <div className="mt-6 p-5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-3">
                        <div className="flex items-center gap-2 text-purple-400 font-bold text-sm uppercase tracking-wider">
                          <Truck className="w-4 h-4 animate-bounce" /> Información de Rastreo
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          {order.carrier && (
                            <div>
                              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Transportadora</p>
                              <p className="font-semibold text-white mt-0.5">{order.carrier}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Número de Guía</p>
                            <p className="font-mono font-semibold text-white mt-0.5">{order.tracking_number}</p>
                          </div>
                        </div>
                        {order.tracking_photo_url && (
                          <div className="pt-2">
                            <a
                              href={order.tracking_photo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-xs font-bold text-neon-cyan hover:underline hover:glow-cyan"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Ver Foto del Comprobante / Guía
                            </a>
                          </div>
                        )}
                        {order.admin_note && (
                          <div className="pt-2 border-t border-purple-500/10 flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-muted-foreground italic">
                              Nota de despacho: "{order.admin_note}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Toggle Items */}
                    <button
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      className="mt-6 w-full flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase text-muted-foreground hover:text-white transition-colors pt-4 border-t border-border/30"
                    >
                      {expandedOrder === order.id ? (
                        <>
                          <ChevronDown className="w-4 h-4 rotate-180 transition-transform" />
                          Ocultar Artículos
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 transition-transform" />
                          Mostrar Artículos
                        </>
                      )}
                    </button>
                  </div>

                  {/* Expanded Items Drawer */}
                  <AnimatePresence>
                    {expandedOrder === order.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-card/20 border-t border-border/20"
                      >
                        <div className="p-6 sm:p-8 space-y-4">
                          <p className="text-xs font-black tracking-widest text-muted-foreground uppercase">Resumen de Productos</p>
                          <div className="divide-y divide-border/20">
                            {order.items?.map((item) => (
                              <div key={item.id} className="py-4 flex justify-between items-center gap-4 first:pt-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                  {item.product_image && (
                                    <div className="w-12 h-12 relative rounded-lg bg-card overflow-hidden border border-border/40 shrink-0">
                                      <Image src={item.product_image} alt={item.product_name} fill className="object-cover" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm font-bold text-white leading-tight">{item.product_name}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {[item.color && `Color: ${item.color}`, item.size && `Talla: ${item.size}`, `Cantidad: ${item.quantity}`]
                                        .filter(Boolean)
                                        .join(' · ')}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm font-black text-neon-pink shrink-0">{formatPrice(item.price * item.quantity)}</p>
                              </div>
                            ))}
                          </div>

                          {/* Pricing breakdown */}
                          <div className="pt-4 border-t border-border/30 space-y-1.5 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                              <span>Subtotal</span>
                              <span className="font-semibold">{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Envío</span>
                              <span className="font-semibold">{formatPrice(order.shipping_cost)}</span>
                            </div>
                            <div className="flex justify-between font-black text-base pt-2 text-white">
                              <span>Total Pagado</span>
                              <span className="text-neon-green">{formatPrice(order.total)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          /* Notifications Tab */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold tracking-wider uppercase">Avisos y Actualizaciones</h3>
              {unreadNotifsCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllNotificationsRead} className="text-xs font-bold text-muted-foreground hover:text-white uppercase">
                  Marcar leídas
                </Button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="text-center py-16 bg-card/30 border border-border/40 rounded-3xl">
                <Bell className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4 animate-swing" />
                <p className="text-muted-foreground text-sm">No tienes notificaciones de pedidos.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-5 rounded-2xl border transition-colors ${
                      notif.read ? 'bg-card/30 border-border/20' : 'bg-card border-neon-pink/30 shadow-md shadow-neon-pink/5'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${notif.read ? 'bg-muted-foreground/30' : 'bg-neon-pink shadow-glow-pink'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm ${notif.read ? 'text-muted-foreground' : 'text-white'}`}>{notif.title}</p>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{notif.message}</p>
                        <p className="text-xs text-muted-foreground/50 mt-3">{formatDate(notif.created_at)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Guest Lookup View (Not Authenticated)
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10 space-y-3">
        <div className="inline-flex p-3 rounded-full bg-neon-pink/10 border border-neon-pink/20 mb-2">
          <Truck className="w-8 h-8 text-neon-pink animate-pulse" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-gradient-neon tracking-tight uppercase">Rastreo de Pedido</h1>
        <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
          Ingresa el número de tu compra y el correo electrónico para verificar el estado de despacho en tiempo real.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-8 items-start">
        {/* Form Container */}
        <div className="md:col-span-2 bg-card/40 backdrop-blur-md border border-border/40 rounded-3xl p-6 shadow-xl space-y-6">
          <h2 className="text-base font-black tracking-widest uppercase text-white">Consulta Rápida</h2>
          
          <form onSubmit={handleTrackFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Número de Pedido</label>
              <Input
                type="text"
                placeholder="Ej: LH-20260609-0012"
                value={trackOrderNumber}
                onChange={(e) => setTrackOrderNumber(e.target.value)}
                className="bg-card/50 border-border text-white text-sm font-semibold py-5 placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Correo Registrado</label>
              <Input
                type="email"
                placeholder="ejemplo@correo.com"
                value={trackEmail}
                onChange={(e) => setTrackEmail(e.target.value)}
                className="bg-card/50 border-border text-white text-sm font-semibold py-5 placeholder:text-muted-foreground/50"
              />
            </div>

            <Button
              type="submit"
              disabled={trackLoading}
              className="w-full btn-neon-pink font-black text-xs uppercase tracking-widest py-6"
            >
              {trackLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Buscando
                </>
              ) : (
                'Rastrear Pedido'
              )}
            </Button>
          </form>

          {trackError && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-red-400/90 leading-normal">{trackError}</p>
            </div>
          )}

          <div className="pt-4 border-t border-border/20 text-center">
            <p className="text-xs text-muted-foreground">¿Eres un cliente registrado?</p>
            <Link href="/auth/login" className="text-xs font-bold text-neon-cyan hover:underline mt-1 inline-block uppercase tracking-wider">
              Iniciar Sesión para ver todo
            </Link>
          </div>
        </div>

        {/* Display Tracked Order */}
        <div className="md:col-span-3">
          {trackedOrder ? (
            <motion.div
              key={trackedOrder.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Top neon line accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-pink to-neon-cyan" />

              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-neon-pink uppercase">Pedido Encontrado</span>
                  <h3 className="text-lg font-mono font-black text-white mt-1">#{trackedOrder.order_number}</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{formatDate(trackedOrder.created_at)}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Monto Total</span>
                  <p className="text-xl font-black text-neon-green mt-1">{formatPrice(trackedOrder.total)}</p>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="py-4 border-t border-b border-border/20 my-4">
                <p className="text-xs font-bold uppercase tracking-wider text-white mb-2">Estado del Pedido</p>
                <OrderTimeline status={trackedOrder.status} />
              </div>

              {/* Tracking Information */}
              {trackedOrder.tracking_number && (
                <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2.5">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                    <Truck className="w-3.5 h-3.5" /> Guía de Transportadora
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-muted-foreground font-semibold">Transportadora</p>
                      <p className="font-bold text-white mt-0.5">{trackedOrder.carrier || 'InterRapidisimo'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-semibold">Guía de envío</p>
                      <p className="font-mono font-bold text-white mt-0.5">{trackedOrder.tracking_number}</p>
                    </div>
                  </div>
                  {trackedOrder.tracking_photo_url && (
                    <div className="pt-1">
                      <a
                        href={trackedOrder.tracking_photo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-neon-cyan hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" /> Ver comprobante de despacho
                      </a>
                    </div>
                  )}
                  {trackedOrder.admin_note && (
                    <div className="pt-2 border-t border-purple-500/10 text-[11px] text-muted-foreground italic leading-relaxed">
                      Comentario: "{trackedOrder.admin_note}"
                    </div>
                  )}
                </div>
              )}

              {/* Item Details */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-white">Artículos</p>
                <div className="divide-y divide-border/20 max-h-[220px] overflow-y-auto pr-1">
                  {trackedOrder.items?.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white leading-tight truncate">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {[item.color && `Color: ${item.color}`, item.size && `Talla: ${item.size}`, `x${item.quantity}`]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                      <p className="text-sm font-black text-neon-pink shrink-0">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border/20 space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(trackedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Costo de envío</span>
                    <span>{formatPrice(trackedOrder.shipping_cost)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-white pt-1">
                    <span>Total Pagado</span>
                    <span className="text-neon-green font-black">{formatPrice(trackedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-card/20 backdrop-blur-md border border-border/30 rounded-3xl p-8 text-center h-full flex flex-col items-center justify-center min-h-[300px]">
              <Info className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <h3 className="text-lg font-bold mb-1.5 text-white/95">Detalle del Pedido</h3>
              <p className="text-muted-foreground text-xs max-w-xs leading-normal">
                Introduce los datos del pedido en el panel lateral para cargar el resumen de tu compra.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PedidosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Navbar />
      
      <main className="pt-28 pb-16 flex-grow container mx-auto px-4">
        <Suspense fallback={
          <div className="min-h-[50vh] flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-neon-pink mb-4" />
            <p className="text-muted-foreground text-xs uppercase font-bold tracking-widest">Cargando...</p>
          </div>
        }>
          <OrdersContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
