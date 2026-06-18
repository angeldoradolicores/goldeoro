'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, Eye, Package, Truck, CheckCircle, Clock, XCircle,
  Loader2, ChevronDown, ExternalLink, DollarSign, X, AlertCircle, Bell, 
  Calendar, Info, ArrowRight, Award
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
    <div className="relative my-8">
      {isCancelled ? (
        <div className="flex items-center gap-3 p-4 rounded-none bg-destructive/10 border border-destructive/20">
          <XCircle className="w-5 h-5 text-destructive shrink-0" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-destructive">Pedido cancelado</p>
            <p className="text-xs text-muted-foreground mt-1">Ponte en contacto con soporte si tienes dudas sobre tu reembolso.</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between relative px-2">
          {/* Progress Line */}
          <div className="absolute top-4 left-6 right-6 h-[1px] bg-steel/30 z-0">
            <div
              className="h-full bg-gold-action transition-all duration-1000"
              style={{ width: currentIdx >= 0 ? `${(currentIdx / (ORDER_STEPS.length - 1)) * 100}%` : '0%' }}
            />
          </div>
          {ORDER_STEPS.map((step, i) => {
            const done = i <= currentIdx
            const active = i === currentIdx
            return (
              <div key={step.key} className="flex flex-col items-center gap-2.5 z-10">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  done ? 'bg-gold-action text-obsidian shadow-lg shadow-gold-action/10' : 'bg-graphite border border-steel/50 text-titanium'
                } ${active ? 'ring-2 ring-gold-action/40 scale-110' : ''}`}>
                  <step.icon className="w-4 h-4" />
                </div>
                <p className={`text-[9px] sm:text-[10px] text-center font-medium tracking-wider uppercase leading-tight max-w-[70px] ${
                  active ? 'text-gold-action font-semibold' : done ? 'text-white-diamond' : 'text-titanium'
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

function OrdersContent({ initialUser, initialOrders }: { initialUser: any, initialOrders: Order[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  // Track Params from Email
  const paramOrderNumber = searchParams.get('order_number')
  const paramEmail = searchParams.get('email')

  // Auth State
  const [user, setUser] = useState<any>(initialUser)

  // Logged-in state
  const [orders, setOrders] = useState<Order[]>(initialOrders || [])
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
    let mounted = true
    let ordersChannel: any = null

    if (user) {
      // Fetch notifications on mount (orders are passed via props)
      fetchNotifications()

      // Set up real-time subscription for order and notification updates
      ordersChannel = supabase
        .channel(`user-updates-${user.id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
          async (payload: any) => {
            if (!mounted) return
            await fetchOrders(user.id)
            toast.info(`Pedido #${payload.new.order_number} actualizado a: ${payload.new.status}`)
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          async (payload: any) => {
            if (!mounted) return
            await fetchNotifications()
            toast.info(`Nueva notificación: ${payload.new.title}`)
          }
        )
        .subscribe()
    }

    // Listen only for sign-out to clear user state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (!mounted) return
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setOrders([])
        setNotifications([])
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
      if (ordersChannel) {
        supabase.removeChannel(ordersChannel)
      }
    }
  }, [user, supabase])

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

  // Logged In Customer Orders View
  if (user) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white-diamond uppercase">Mis Pedidos</h1>
            <p className="text-titanium text-sm mt-1 max-w-xl font-light leading-relaxed">Historial completo, estado de envío y actualizaciones en tiempo real de tus compras.</p>
          </div>
          <div className="flex bg-graphite border border-steel/30 p-1 rounded-none gap-1 self-stretch md:self-auto shadow-lg">
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-none text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                activeTab === 'pedidos' ? 'bg-gold-action text-obsidian' : 'text-chrome hover:text-white-diamond'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              Pedidos ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('notificaciones')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-none text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                activeTab === 'notificaciones' ? 'bg-gold-action text-obsidian' : 'text-chrome hover:text-white-diamond'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              Avisos
              {unreadNotifsCount > 0 && (
                <span className="w-5 h-5 bg-white-diamond text-obsidian rounded-full flex items-center justify-center text-[10px] font-bold">
                  {unreadNotifsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {activeTab === 'pedidos' ? (
          orders.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-carbon border border-steel/30 rounded-none p-8 shadow-xl">
              <Package className="w-16 h-16 text-steel mx-auto mb-6" />
              <h3 className="text-lg font-display uppercase tracking-widest mb-2 text-white-diamond">Aún no tienes pedidos</h3>
              <p className="text-titanium text-sm max-w-sm mx-auto mb-8 font-light">Explora nuestro catálogo de camisetas, álbumes Panini y coleccionables oficiales del Mundial 2026.</p>
              <Link href="/catalogo">
                <Button className="btn-luxury py-5 px-8 font-bold uppercase tracking-widest text-xs rounded-none">
                  Explorar Catálogo
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {orders.map((order, idx) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-carbon border border-steel/30 rounded-none overflow-hidden hover:border-gold-action/20 transition-all duration-300 shadow-2xl"
                >
                  {/* Order Header */}
                  <div className="p-6 sm:p-8 border-b border-steel/10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-action">Número de Pedido</span>
                          <span className="text-[9px] tracking-widest uppercase bg-graphite border border-steel/40 text-titanium px-2 py-0.5 font-medium">
                            {order.status === 'paid' ? 'Pagado' : order.status === 'pending' ? 'Pendiente' : order.status === 'processing' ? 'Procesando' : order.status === 'shipped' ? 'En camino' : order.status === 'delivered' ? 'Entregado' : 'Cancelado'}
                          </span>
                        </div>
                        <h3 className="text-xl font-display font-semibold tracking-tight text-white-diamond">#{order.order_number}</h3>
                        <p className="text-xs text-titanium flex items-center gap-1.5 font-light">
                          <Calendar className="w-3.5 h-3.5 text-gold-action" /> {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] font-semibold tracking-widest text-titanium uppercase">Monto Total</p>
                        <p className="text-xl font-bold text-white-diamond mt-1">{formatPrice(order.total)}</p>
                      </div>
                    </div>

                    {/* Timeline */}
                    <OrderTimeline status={order.status} />

                    {/* Tracking details if available */}
                    {order.tracking_number && (
                      <div className="mt-8 p-5 rounded-none bg-graphite/40 border border-steel/30 space-y-4">
                        <div className="flex items-center gap-2 text-gold-action font-semibold text-xs uppercase tracking-widest">
                          <Truck className="w-4 h-4" /> Información de Rastreo
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          {order.carrier && (
                            <div>
                              <p className="text-[10px] text-titanium uppercase font-medium tracking-wider">Transportadora</p>
                              <p className="font-semibold text-white-diamond mt-0.5">{order.carrier}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-[10px] text-titanium uppercase font-medium tracking-wider">Número de Guía</p>
                            <p className="font-mono font-semibold text-white-diamond mt-0.5">{order.tracking_number}</p>
                          </div>
                        </div>
                        {order.tracking_photo_url && (
                          <div className="pt-2 border-t border-steel/10">
                            <a
                              href={order.tracking_photo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-xs font-medium text-gold-action hover:underline"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Ver Foto del Comprobante / Guía
                            </a>
                          </div>
                        )}
                        {order.admin_note && (
                          <div className="pt-3 border-t border-steel/10 flex items-start gap-2">
                            <Info className="w-3.5 h-3.5 text-gold-action shrink-0 mt-0.5" />
                            <p className="text-xs text-titanium italic leading-relaxed">
                              Nota de despacho: "{order.admin_note}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Toggle Items */}
                    <button
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      className="mt-6 w-full flex items-center justify-center gap-2 text-[10px] font-semibold tracking-widest uppercase text-chrome hover:text-white-diamond transition-colors pt-4 border-t border-steel/20"
                    >
                      {expandedOrder === order.id ? (
                        <>
                          <ChevronDown className="w-3.5 h-3.5 rotate-180 transition-transform" />
                          Ocultar Artículos
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5 transition-transform" />
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
                        className="bg-graphite/20 border-t border-steel/20"
                      >
                        <div className="p-6 sm:p-8 space-y-6">
                          <p className="text-[10px] font-bold tracking-widest text-titanium uppercase">Resumen de Productos</p>
                          <div className="divide-y divide-steel/20">
                            {order.items?.map((item) => (
                              <div key={item.id} className="py-4 flex justify-between items-center gap-4 first:pt-0 last:pb-0">
                                <div className="flex items-center gap-4">
                                  {item.product_image && (
                                    <div className="w-14 h-14 relative rounded-none bg-graphite overflow-hidden border border-steel/30 shrink-0">
                                      <Image src={item.product_image} alt={item.product_name} fill className="object-cover animate-fade-in" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm font-bold text-white-diamond leading-tight">{item.product_name}</p>
                                    <p className="text-xs text-titanium mt-1 font-light">
                                      {[item.color && `Color: ${item.color}`, item.size && `Talla: ${item.size}`, `Cantidad: ${item.quantity}`]
                                        .filter(Boolean)
                                        .join(' · ')}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm font-medium text-gold-action shrink-0">{formatPrice(item.price * item.quantity)}</p>
                              </div>
                            ))}
                          </div>

                          {/* Pricing breakdown */}
                          <div className="pt-6 border-t border-steel/20 space-y-2 text-sm font-light">
                            <div className="flex justify-between text-titanium">
                              <span>Subtotal</span>
                              <span className="font-medium text-white-diamond">{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-titanium">
                              <span>Envío</span>
                              <span className="font-medium text-white-diamond">{formatPrice(order.shipping_cost)}</span>
                            </div>
                            <div className="flex justify-between font-medium text-base pt-3 border-t border-steel/10 text-white-diamond">
                              <span>Total Pagado</span>
                              <span className="text-gold-action font-semibold">{formatPrice(order.total)}</span>
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display uppercase tracking-widest text-white-diamond">Avisos y Actualizaciones</h3>
              {unreadNotifsCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllNotificationsRead} className="text-[10px] font-semibold text-titanium hover:text-white-diamond uppercase tracking-wider rounded-none">
                  Marcar todas como leídas
                </Button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="text-center py-20 bg-carbon border border-steel/30 rounded-none p-8">
                <Bell className="w-12 h-12 text-steel mx-auto mb-4" />
                <p className="text-titanium text-sm font-light">No tienes notificaciones de pedidos en este momento.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-6 rounded-none border transition-colors ${
                      notif.read ? 'bg-carbon/50 border-steel/20' : 'bg-carbon border-gold-action/30 shadow-lg shadow-gold-action/5'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${notif.read ? 'bg-steel' : 'bg-gold-action'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${notif.read ? 'text-titanium' : 'text-white-diamond'}`}>{notif.title}</p>
                        <p className="text-sm text-titanium mt-1 leading-relaxed font-light">{notif.message}</p>
                        <p className="text-[10px] text-steel mt-3 tracking-wider font-light">{formatDate(notif.created_at)}</p>
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
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex p-4 rounded-none bg-graphite border border-steel/30 mb-2">
          <Truck className="w-8 h-8 text-gold-action" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-white-diamond uppercase">Rastreo de Pedido</h1>
        <p className="text-titanium max-w-md mx-auto text-sm font-light leading-relaxed">
          Ingresa el número de tu compra y el correo electrónico para verificar el estado de despacho en tiempo real.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-8 items-start">
        {/* Form Container */}
        <div className="md:col-span-2 bg-carbon border border-steel/30 rounded-none p-6 sm:p-8 shadow-2xl space-y-6">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-action">Consulta Rápida</h2>
          
          <form onSubmit={handleTrackFormSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Número de Pedido</label>
              <Input
                type="text"
                placeholder="Ej: LH-20260609-0012"
                value={trackOrderNumber}
                onChange={(e) => setTrackOrderNumber(e.target.value)}
                className="bg-graphite border-steel/30 text-white-diamond text-sm font-medium py-5 placeholder:text-steel rounded-none focus:border-gold-action"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Correo Registrado</label>
              <Input
                type="email"
                placeholder="ejemplo@correo.com"
                value={trackEmail}
                onChange={(e) => setTrackEmail(e.target.value)}
                className="bg-graphite border-steel/30 text-white-diamond text-sm font-medium py-5 placeholder:text-steel rounded-none focus:border-gold-action"
              />
            </div>

            <Button
              type="submit"
              disabled={trackLoading}
              className="w-full btn-luxury font-semibold text-xs uppercase tracking-[0.25em] py-6 rounded-none"
            >
              {trackLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Buscando...
                </>
              ) : (
                'Rastrear Pedido'
              )}
            </Button>
          </form>

          {trackError && (
            <div className="p-4 rounded-none bg-destructive/10 border border-destructive/20 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-destructive leading-normal">{trackError}</p>
            </div>
          )}

          <div className="pt-6 border-t border-steel/20 text-center">
            <p className="text-xs text-titanium font-light">¿Eres un cliente registrado?</p>
            <Link href="/auth/login" className="text-xs font-bold text-gold-action hover:underline mt-2 inline-block uppercase tracking-wider">
              Iniciar Sesión
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
              className="bg-carbon border border-steel/30 rounded-none p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Top luxury line accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gold-action" />

              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[9px] font-bold tracking-widest text-gold-action uppercase">Pedido Encontrado</span>
                  <h3 className="text-lg font-display font-semibold text-white-diamond mt-1">#{trackedOrder.order_number}</h3>
                  <p className="text-[10px] text-titanium mt-0.5 font-light">{formatDate(trackedOrder.created_at)}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold tracking-widest text-titanium uppercase">Monto Total</span>
                  <p className="text-lg font-bold text-white-diamond mt-1">{formatPrice(trackedOrder.total)}</p>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="py-6 border-t border-b border-steel/10 my-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-white-diamond mb-3">Estado del Pedido</p>
                <OrderTimeline status={trackedOrder.status} />
              </div>

              {/* Tracking Information */}
              {trackedOrder.tracking_number && (
                <div className="mb-6 p-4 rounded-none bg-graphite/40 border border-steel/30 space-y-3">
                  <div className="flex items-center gap-2 text-gold-action font-semibold text-xs uppercase tracking-widest">
                    <Truck className="w-3.5 h-3.5" /> Guía de Transportadora
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-light">
                    <div>
                      <p className="text-titanium font-medium">Transportadora</p>
                      <p className="font-semibold text-white-diamond mt-0.5">{trackedOrder.carrier || 'InterRapidisimo'}</p>
                    </div>
                    <div>
                      <p className="text-titanium font-medium">Guía de envío</p>
                      <p className="font-mono font-semibold text-white-diamond mt-0.5">{trackedOrder.tracking_number}</p>
                    </div>
                  </div>
                  {trackedOrder.tracking_photo_url && (
                    <div className="pt-2 border-t border-steel/10">
                      <a
                        href={trackedOrder.tracking_photo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-gold-action hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" /> Ver comprobante de despacho
                      </a>
                    </div>
                  )}
                  {trackedOrder.admin_note && (
                    <div className="pt-3 border-t border-steel/10 text-xs text-titanium italic leading-relaxed">
                      Comentario: "{trackedOrder.admin_note}"
                    </div>
                  )}
                </div>
              )}

              {/* Item Details */}
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-white-diamond">Artículos</p>
                <div className="divide-y divide-steel/10 max-h-[220px] overflow-y-auto pr-2">
                  {trackedOrder.items?.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white-diamond leading-tight truncate">{item.product_name}</p>
                        <p className="text-xs text-titanium mt-1 font-light">
                          {[item.color && `Color: ${item.color}`, item.size && `Talla: ${item.size}`, `x${item.quantity}`]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gold-action shrink-0">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-steel/25 space-y-2 text-xs font-light">
                  <div className="flex justify-between text-titanium">
                    <span>Subtotal</span>
                    <span className="text-white-diamond">{formatPrice(trackedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-titanium">
                    <span>Costo de envío</span>
                    <span className="text-white-diamond">{formatPrice(trackedOrder.shipping_cost)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-sm text-white-diamond pt-2 border-t border-steel/10">
                    <span>Total Pagado</span>
                    <span className="text-gold-action font-bold">{formatPrice(trackedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-graphite/10 border border-steel/30 rounded-none p-8 text-center h-full flex flex-col items-center justify-center min-h-[300px]">
              <Info className="w-12 h-12 text-steel mb-4" />
              <h3 className="text-lg font-display uppercase tracking-widest mb-2 text-white-diamond">Detalle del Pedido</h3>
              <p className="text-titanium text-xs max-w-xs leading-normal font-light">
                Introduce los datos del pedido en el panel lateral para cargar el resumen de tu compra.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PedidosClient({ initialUser, initialOrders }: { initialUser: any, initialOrders: Order[] }) {
  return (
    <div className="min-h-screen bg-obsidian text-foreground flex flex-col justify-between">
      <Navbar />
      
      <main className="pt-36 pb-20 flex-grow container mx-auto px-4 max-w-7xl">
        <Suspense fallback={
          <div className="min-h-[50vh] flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gold-action mb-4" />
            <p className="text-titanium text-xs uppercase font-semibold tracking-widest">Cargando...</p>
          </div>
        }>
          <OrdersContent initialUser={initialUser} initialOrders={initialOrders} />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
