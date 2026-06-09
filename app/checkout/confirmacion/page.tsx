'use client'

import { useEffect, useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Clock, Package, Truck, CreditCard, ArrowRight, Loader2 } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price)
}

interface OrderData {
  id: string
  order_number: string
  status: string
  total: number
  subtotal: number
  shipping_cost: number
  discount: number
  shipping_method: string
  shipping_address: {
    fullName: string
    city: string
    street: string
  }
  items: {
    id: string
    product_name: string
    quantity: number
    price: number
    color?: string
    size?: string
  }[]
  transactionStatus?: string
  transactionMessage?: string
}

function ConfirmacionContent() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('ref')
  const status = searchParams.get('status')
  
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (reference) {
      fetchOrder()
    } else {
      setError('Referencia de orden no encontrada')
      setLoading(false)
    }
  }, [reference])

  const fetchOrder = async () => {
    try {
      const wompiId = searchParams.get('id')
      const url = `/api/orders/${reference}${wompiId ? `?wompi_id=${wompiId}` : ''}`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Orden no encontrada')
      }
      const data = await response.json()
      setOrder(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la orden')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-32 pb-16 container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Verificando tu pedido...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-32 pb-16 container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center py-16">
            <XCircle className="w-20 h-20 mx-auto text-destructive mb-6" />
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link href="/catalogo">
              <Button className="btn-luxury">Volver al Catalogo</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const orderStatus = order?.transactionStatus || order?.status || status
  const isApproved = orderStatus === 'APPROVED' || orderStatus === 'paid'
  const isPending = orderStatus === 'PENDING' || orderStatus === 'pending'
  const isDeclined = orderStatus === 'DECLINED' || orderStatus === 'ERROR' || orderStatus === 'cancelled'

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-32 pb-16 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Status Icon */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                isApproved ? 'bg-green-500/20' : 
                isPending ? 'bg-yellow-500/20' : 
                'bg-destructive/20'
              }`}
            >
              {isApproved && <CheckCircle className="w-12 h-12 text-green-500" />}
              {isPending && <Clock className="w-12 h-12 text-yellow-500" />}
              {isDeclined && <XCircle className="w-12 h-12 text-destructive" />}
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              {isApproved && <>Pedido <span className="text-gradient-gold">Confirmado!</span></>}
              {isPending && <>Pago <span className="text-yellow-500">Pendiente</span></>}
              {isDeclined && <>Pago <span className="text-destructive">Rechazado</span></>}
            </h1>

            <p className="text-muted-foreground mb-2">
              {isApproved && 'Gracias por tu compra. Hemos enviado los detalles a tu email.'}
              {isPending && 'Tu pedido esta siendo procesado. Te notificaremos cuando se confirme el pago.'}
              {isDeclined && 'Hubo un problema con tu pago. Por favor intenta nuevamente.'}
            </p>

            {order && (
              <p className="text-sm text-muted-foreground">
                Numero de orden: <span className="text-primary font-mono font-semibold">{order.order_number}</span>
              </p>
            )}
          </div>

          {/* Order Details */}
          {order && (
            <div className="bg-card border border-border/50 rounded-2xl p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Detalles del Pedido
              </h2>

              {/* Products */}
              <div className="space-y-3 mb-6 pb-6 border-b border-border">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">{item.product_name}</span>
                      <span className="text-muted-foreground"> x{item.quantity}</span>
                      {(item.color || item.size) && (
                        <span className="text-muted-foreground text-xs block">
                          {item.color} {item.size && `/ ${item.size}`}
                        </span>
                      )}
                    </div>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envio</span>
                  <span>{formatPrice(order.shipping_cost)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-500">
                    <span>Descuento</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2">
                  <span>Total</span>
                  <span className="text-gradient-gold">{formatPrice(order.total)}</span>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-primary" />
                    Envio
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {order.shipping_method === 'recoger' ? 'Recoger en tienda' : order.shipping_method}
                  </p>
                  {order.shipping_address && (
                    <p className="text-sm text-muted-foreground">
                      {order.shipping_address.fullName}<br />
                      {order.shipping_address.street}<br />
                      {order.shipping_address.city}
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    Pago
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Estado: <span className={`font-medium ${
                      isApproved ? 'text-green-500' : 
                      isPending ? 'text-yellow-500' : 
                      'text-destructive'
                    }`}>
                      {isApproved && 'Aprobado'}
                      {isPending && 'Pendiente'}
                      {isDeclined && 'Rechazado'}
                    </span>
                  </p>
                  {order.transactionMessage && (
                    <p className="text-xs text-muted-foreground">{order.transactionMessage}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalogo">
              <Button className="btn-luxury w-full sm:w-auto">
                Seguir Comprando
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="border-border/50 w-full sm:w-auto">
                Volver al Inicio
              </Button>
            </Link>
          </div>

          {/* Help */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Tienes alguna pregunta? Contactanos por{' '}
              <Link href="/contacto" className="text-primary hover:underline">
                WhatsApp
              </Link>
              {' '}o{' '}
              <Link href="/contacto" className="text-primary hover:underline">
                email
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-32 pb-16 container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </main>
    }>
      <ConfirmacionContent />
    </Suspense>
  )
}
