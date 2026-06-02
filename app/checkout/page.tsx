'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Truck, CreditCard, MapPin, CheckCircle, Minus, Plus, Trash2, Package, Loader2, Smartphone, Building2 } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price)
}

const colombianCities = [
  'Bogota', 'Medellin', 'Cali', 'Barranquilla', 'Cartagena', 
  'Bucaramanga', 'Pereira', 'Manizales', 'Santa Marta', 'Cucuta',
  'Ibague', 'Villavicencio', 'Pasto', 'Monteria', 'Neiva'
]

const shippingOptions = [
  { id: 'interrapidisimo', name: 'InterRapidisimo', days: '2-3 dias', price: 15000, logo: '/images/interrapidisimo.png' },
  { id: 'enviar', name: 'Envia Standard', days: '3-5 dias', price: 12000, logo: '/images/envia.png' },
  { id: 'express', name: 'Envia Express', days: '1-2 dias', price: 25000, logo: '/images/envia.png' },
  { id: 'recoger', name: 'Recoger en Tienda', days: 'Disponible en 24h', price: 0, logo: null },
]

const paymentMethods = [
  { id: 'CARD', name: 'Tarjeta de Credito/Debito', icon: CreditCard, description: 'Visa, Mastercard, Amex' },
  { id: 'NEQUI', name: 'Nequi', icon: Smartphone, description: 'Pago con tu celular' },
  { id: 'PSE', name: 'PSE', icon: Building2, description: 'Debito bancario' },
]

export default function CheckoutPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore()
  const router = useRouter()
  const cartTotal = total()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null)
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)

  // Form data
  const [shippingData, setShippingData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    postalCode: '',
  })
  const [selectedShipping, setSelectedShipping] = useState('')
  const [selectedPayment, setSelectedPayment] = useState('CARD')
  const [cardData, setCardData] = useState({
    number: '',
    expMonth: '',
    expYear: '',
    cvc: '',
    holder: '',
  })
  const [nequiPhone, setNequiPhone] = useState('')

  const shippingCost = shippingOptions.find(s => s.id === selectedShipping)?.price || 0
  const discountAmount = appliedPromo?.discount || 0
  const finalTotal = cartTotal + shippingCost - discountAmount

  // Apply promo code
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return
    setIsApplyingPromo(true)

    try {
      const response = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Codigo no valido')
        return
      }

      const promotion = await response.json()
      let discount = 0

      if (promotion.discount_type === 'percentage') {
        discount = Math.round(cartTotal * (promotion.discount_value / 100))
      } else {
        discount = promotion.discount_value
      }

      setAppliedPromo({ code: promotion.code, discount })
      toast.success(`Codigo aplicado: ${formatPrice(discount)} de descuento`)
    } catch {
      toast.error('Error al aplicar el codigo')
    } finally {
      setIsApplyingPromo(false)
    }
  }

  // Complete order
  const handleCompleteOrder = async () => {
    if (!shippingData.fullName || !shippingData.email || !shippingData.phone || !shippingData.city || !shippingData.address) {
      toast.error('Por favor completa todos los campos de envio')
      setStep(2)
      return
    }

    if (!selectedShipping) {
      toast.error('Por favor selecciona un metodo de envio')
      setStep(2)
      return
    }

    if (selectedPayment === 'CARD' && (!cardData.number || !cardData.expMonth || !cardData.expYear || !cardData.cvc)) {
      toast.error('Por favor completa los datos de la tarjeta')
      return
    }

    if (selectedPayment === 'NEQUI' && !nequiPhone) {
      toast.error('Por favor ingresa tu numero de Nequi')
      return
    }

    setIsLoading(true)

    try {
      const orderItems = items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.images[0],
        price: item.product.price,
        quantity: item.quantity,
        color: item.selectedColor,
        size: item.selectedSize,
      }))

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderItems,
          shippingInfo: {
            name: shippingData.fullName,
            phone: shippingData.phone,
            email: shippingData.email,
            address: shippingData.address,
            city: shippingData.city,
            state: shippingData.city,
            postalCode: shippingData.postalCode || '000000',
            notes: '',
          },
          shippingCost,
          paymentMethod: selectedPayment,
        }),
      })

      const data = await response.json()

      if (data.checkoutUrl) {
        // Redirect to Wompi checkout
        clearCart()
        window.location.href = data.checkoutUrl
        return
      }

      if (data.success) {
        clearCart()
        router.push(`/checkout/confirmacion?ref=${data.orderReference}`)
      } else if (data.orderId) {
        // Order created but payment failed - redirect to confirmation with pending status
        clearCart()
        router.push(`/checkout/confirmacion?ref=${data.orderReference}&status=pending`)
      } else {
        toast.error(data.error || 'Error al procesar el pedido')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Error al procesar el pedido')
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-32 pb-16 container mx-auto px-4">
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Tu carrito esta vacio</h1>
            <p className="text-muted-foreground mb-6">
              Agrega algunas gorras premium para continuar
            </p>
            <Link href="/catalogo">
              <Button className="btn-luxury">Explorar Catalogo</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Seguir Comprando
            </Link>
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-display font-bold mb-8">
            Finalizar <span className="text-gradient-gold">Compra</span>
          </h1>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {[
              { num: 1, label: 'Carrito', icon: Package },
              { num: 2, label: 'Envio', icon: Truck },
              { num: 3, label: 'Pago', icon: CreditCard },
            ].map((s, index) => (
              <div key={s.num} className="flex items-center gap-4">
                <button
                  onClick={() => s.num <= step && setStep(s.num)}
                  disabled={s.num > step}
                  className={`flex items-center gap-2 ${s.num <= step ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    s.num < step ? 'bg-primary text-primary-foreground' : 
                    s.num === step ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : 
                    'bg-secondary'
                  }`}>
                    {s.num < step ? <CheckCircle className="w-5 h-5" /> : s.num}
                  </span>
                  <span className="hidden sm:inline font-medium">{s.label}</span>
                </button>
                {index < 2 && (
                  <div className={`w-12 h-0.5 transition-all ${s.num < step ? 'bg-primary' : 'bg-secondary'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="cart"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      Tu Carrito ({items.length} {items.length === 1 ? 'producto' : 'productos'})
                    </h2>
                    {items.map((item) => (
                      <div
                        key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
                        className="flex gap-4 p-4 rounded-xl bg-card border border-border/50"
                      >
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.product.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.selectedColor} / {item.selectedSize}
                          </p>
                          <p className="text-primary font-semibold mt-1">
                            {formatPrice(item.product.price)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-7 h-7 rounded bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-7 h-7 rounded bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button onClick={() => setStep(2)} className="w-full btn-luxury py-6 text-lg">
                      Continuar con Envio
                    </Button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="shipping"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Truck className="w-5 h-5 text-primary" />
                      Informacion de Envio
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label>Nombre Completo *</Label>
                        <Input
                          value={shippingData.fullName}
                          onChange={(e) => setShippingData({ ...shippingData, fullName: e.target.value })}
                          className="mt-1 bg-secondary border-border/50"
                          placeholder="Juan Perez"
                          required
                        />
                      </div>
                      <div>
                        <Label>Email *</Label>
                        <Input
                          type="email"
                          value={shippingData.email}
                          onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                          className="mt-1 bg-secondary border-border/50"
                          placeholder="tu@email.com"
                          required
                        />
                      </div>
                      <div>
                        <Label>Telefono *</Label>
                        <Input
                          value={shippingData.phone}
                          onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                          className="mt-1 bg-secondary border-border/50"
                          placeholder="+57 300 123 4567"
                          required
                        />
                      </div>
                      <div>
                        <Label>Ciudad *</Label>
                        <Select value={shippingData.city} onValueChange={(value) => setShippingData({ ...shippingData, city: value })}>
                          <SelectTrigger className="mt-1 bg-secondary border-border/50">
                            <SelectValue placeholder="Selecciona tu ciudad" />
                          </SelectTrigger>
                          <SelectContent>
                            {colombianCities.map((city) => (
                              <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Codigo Postal</Label>
                        <Input
                          value={shippingData.postalCode}
                          onChange={(e) => setShippingData({ ...shippingData, postalCode: e.target.value })}
                          className="mt-1 bg-secondary border-border/50"
                          placeholder="110111"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Direccion *</Label>
                        <Input
                          value={shippingData.address}
                          onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                          className="mt-1 bg-secondary border-border/50"
                          placeholder="Calle 123 #45-67, Barrio, Apto 101"
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        Metodo de Envio
                      </h3>
                      <RadioGroup value={selectedShipping} onValueChange={setSelectedShipping}>
                        <div className="space-y-3">
                          {shippingOptions.map((option) => (
                            <div
                              key={option.id}
                              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                                selectedShipping === option.id 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-border/50 hover:border-primary/50'
                              }`}
                              onClick={() => setSelectedShipping(option.id)}
                            >
                              <div className="flex items-center gap-3">
                                <RadioGroupItem value={option.id} id={option.id} />
                                <div>
                                  <p className="font-medium">{option.name}</p>
                                  <p className="text-sm text-muted-foreground">{option.days}</p>
                                </div>
                              </div>
                              <span className={`font-semibold ${option.price === 0 ? 'text-green-500' : 'text-primary'}`}>
                                {option.price === 0 ? 'Gratis' : formatPrice(option.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setStep(1)} className="flex-1 border-border/50">
                        Atras
                      </Button>
                      <Button 
                        onClick={() => setStep(3)} 
                        className="flex-1 btn-luxury"
                        disabled={!shippingData.city || !selectedShipping || !shippingData.fullName || !shippingData.email || !shippingData.phone || !shippingData.address}
                      >
                        Continuar con Pago
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      Metodo de Pago
                    </h2>

                    {/* Payment Method Selection */}
                    <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {paymentMethods.map((method) => (
                          <div
                            key={method.id}
                            className={`flex flex-col items-center p-4 rounded-xl border cursor-pointer transition-all ${
                              selectedPayment === method.id 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border/50 hover:border-primary/50'
                            }`}
                            onClick={() => setSelectedPayment(method.id)}
                          >
                            <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                            <method.icon className={`w-8 h-8 mb-2 ${selectedPayment === method.id ? 'text-primary' : 'text-muted-foreground'}`} />
                            <p className="font-medium text-sm text-center">{method.name}</p>
                            <p className="text-xs text-muted-foreground text-center">{method.description}</p>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>

                    {/* Card Payment Form */}
                    {selectedPayment === 'CARD' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 rounded-xl border border-border/50 space-y-4"
                      >
                        <div>
                          <Label>Numero de Tarjeta</Label>
                          <Input
                            value={cardData.number}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').substring(0, 16)
                              const formatted = value.replace(/(\d{4})/g, '$1 ').trim()
                              setCardData({ ...cardData, number: formatted })
                            }}
                            className="mt-1 bg-secondary border-border/50 font-mono"
                            placeholder="1234 5678 9012 3456"
                          />
                        </div>
                        <div>
                          <Label>Nombre en la Tarjeta</Label>
                          <Input
                            value={cardData.holder}
                            onChange={(e) => setCardData({ ...cardData, holder: e.target.value.toUpperCase() })}
                            className="mt-1 bg-secondary border-border/50"
                            placeholder="JUAN PEREZ"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Mes</Label>
                            <Select value={cardData.expMonth} onValueChange={(value) => setCardData({ ...cardData, expMonth: value })}>
                              <SelectTrigger className="mt-1 bg-secondary border-border/50">
                                <SelectValue placeholder="MM" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((month) => (
                                  <SelectItem key={month} value={month}>{month}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Ano</Label>
                            <Select value={cardData.expYear} onValueChange={(value) => setCardData({ ...cardData, expYear: value })}>
                              <SelectTrigger className="mt-1 bg-secondary border-border/50">
                                <SelectValue placeholder="AA" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() + i).slice(-2)).map((year) => (
                                  <SelectItem key={year} value={year}>{year}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>CVV</Label>
                            <Input
                              type="password"
                              value={cardData.cvc}
                              onChange={(e) => setCardData({ ...cardData, cvc: e.target.value.replace(/\D/g, '').substring(0, 4) })}
                              className="mt-1 bg-secondary border-border/50"
                              placeholder="123"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Nequi Form */}
                    {selectedPayment === 'NEQUI' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 rounded-xl border border-border/50"
                      >
                        <Label>Numero de Nequi</Label>
                        <Input
                          value={nequiPhone}
                          onChange={(e) => setNequiPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                          className="mt-1 bg-secondary border-border/50"
                          placeholder="3001234567"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Recibiras una notificacion en tu app Nequi para confirmar el pago
                        </p>
                      </motion.div>
                    )}

                    {/* PSE Info */}
                    {selectedPayment === 'PSE' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 rounded-xl border border-border/50 bg-blue-500/10"
                      >
                        <p className="text-sm text-muted-foreground">
                          Seras redirigido a la plataforma de PSE para completar tu pago de forma segura con tu banco.
                        </p>
                      </motion.div>
                    )}

                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setStep(2)} className="flex-1 border-border/50">
                        Atras
                      </Button>
                      <Button 
                        onClick={handleCompleteOrder} 
                        disabled={isLoading}
                        className="flex-1 btn-luxury"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>Pagar {formatPrice(finalTotal)}</>
                        )}
                      </Button>
                    </div>

                    {/* Security badges */}
                    <div className="flex items-center justify-center gap-4 pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Pago 100% seguro
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CreditCard className="w-4 h-4" />
                        Procesado por Wompi
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 p-6 rounded-2xl bg-card border border-border/50">
                <h3 className="text-lg font-semibold mb-4">Resumen del Pedido</h3>

                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={`summary-${item.product.id}`}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-muted-foreground truncate max-w-[60%]">
                        {item.product.name} x{item.quantity}
                      </span>
                      <span>{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envio</span>
                    <span>{shippingCost > 0 ? formatPrice(shippingCost) : selectedShipping === 'recoger' ? 'Gratis' : 'Por calcular'}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-sm text-green-500">
                      <span>Descuento ({appliedPromo.code})</span>
                      <span>-{formatPrice(appliedPromo.discount)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-border mt-4 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold text-gradient-gold">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mt-6">
                  <Label className="text-sm">Codigo Promocional</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="bg-secondary border-border/50"
                      placeholder="LUXURY30"
                      disabled={!!appliedPromo}
                    />
                    <Button 
                      variant="outline" 
                      className="border-border/50 shrink-0"
                      onClick={handleApplyPromo}
                      disabled={isApplyingPromo || !!appliedPromo}
                    >
                      {isApplyingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aplicar'}
                    </Button>
                  </div>
                  {appliedPromo && (
                    <button
                      onClick={() => {
                        setAppliedPromo(null)
                        setPromoCode('')
                      }}
                      className="text-xs text-destructive mt-2 hover:underline"
                    >
                      Remover codigo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
