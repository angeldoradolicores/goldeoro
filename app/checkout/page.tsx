'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image';
import departmentsData from '../../departments.json';
import citiesData from '../../cities.json';
import Link from 'next/link';
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

// Mapping of departments to their municipalities (cities) generated from JSON data
const departmentMunicipalities: Record<string, string[]> = {};

departmentsData.data.forEach((dept: { id: number; name: string }) => {
  const towns = citiesData.data
    .filter((c: { departmentId: number; name: string }) => c.departmentId === dept.id)
    .map((c: { name: string }) => c.name);
  departmentMunicipalities[dept.name] = towns;
});

const shippingOptions = [
  { id: 'interrapidisimo', name: 'InterRapidisimo', days: '2-3 dias', price: 17000, logo: '/images/interrapidisimo.png' },
  { id: 'recoger', name: 'Recoger en Tienda', days: 'Disponible en 24h', price: 0, logo: null },
]

const paymentMethods = [
  { id: 'CARD', name: 'Tarjeta de Crédito/Débito', icon: CreditCard, description: 'Visa, Mastercard, Amex' },
  { id: 'NEQUI', name: 'Nequi', icon: Smartphone, description: 'Pago con tu celular' },
  { id: 'PSE', name: 'PSE', icon: Building2, description: 'Débito bancario' },
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
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [municipalities, setMunicipalities] = useState<string[]>([]);
  const [selectedPayment, setSelectedPayment] = useState('CARD')
  const [cardData, setCardData] = useState({
    number: '',
    expMonth: '',
    expYear: '',
    cvc: '',
    holder: '',
  })
  const [nequiPhone, setNequiPhone] = useState('')

  const [selectedShipping, setSelectedShipping] = useState('')
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
        toast.error(error.error || 'Código no válido')
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
      toast.success(`Código aplicado: ${formatPrice(discount)} de descuento`)
    } catch {
      toast.error('Error al aplicar el código')
    } finally {
      setIsApplyingPromo(false)
    }
  }

  // Complete order
  const handleCompleteOrder = async () => {
    if (!shippingData.fullName || !shippingData.email || !shippingData.phone || !selectedDepartment || !shippingData.city || !shippingData.address) {
      toast.error('Por favor completa todos los campos de envío')
      setStep(2)
      return
    }
    // Simple email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingData.email)) {
      toast.error('Correo electrónico no válido')
      setStep(2)
      return
    }
    // Simple phone validation (digits only, length 7-15)
    if (!/^\d{7,15}$/.test(shippingData.phone.replace(/\D/g, ''))) {
      toast.error('Número de celular no válido')
      setStep(2)
      return
    }

    if (!selectedShipping) {
      toast.error('Por favor selecciona un método de envío')
      setStep(2)
      return
    }

    if (selectedPayment === 'CARD' && (!cardData.number || !cardData.expMonth || !cardData.expYear || !cardData.cvc)) {
      toast.error('Por favor completa los datos de la tarjeta')
      return
    }

    if (selectedPayment === 'NEQUI' && !nequiPhone) {
      toast.error('Por favor ingresa tu número de Nequi')
      return
    }

    setIsLoading(true)

    try {
      const orderItems = items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.images?.[0] || '/images/placeholder-hat.jpg',
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
            state: selectedDepartment,
            postalCode: shippingData.postalCode || '000000',
            notes: '',
          },
          shippingMethod: selectedShipping,
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
      <main className="min-h-screen bg-obsidian">
        <Navbar />
        <div className="pt-40 pb-20 container mx-auto px-4 max-w-7xl">
          <div className="text-center py-24 bg-carbon border border-steel/30 rounded-none shadow-2xl">
            <Package className="w-16 h-16 mx-auto text-steel mb-6" />
            <h1 className="text-xl font-display font-semibold uppercase tracking-wider text-white-diamond mb-4">Tu carrito está vacío</h1>
            <p className="text-titanium text-sm max-w-xs mx-auto mb-8 font-light leading-relaxed">
              Agrega algunas gorras exclusivas para continuar con tu proceso de compra.
            </p>
            <Link href="/catalogo">
              <Button className="btn-luxury rounded-none text-xs uppercase tracking-widest font-semibold px-8 py-5">Explorar Catálogo</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-obsidian text-foreground">
      <Navbar />

      <section className="pt-36 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-chrome hover:text-gold-action transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Seguir Comprando
            </Link>
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-display font-bold mb-10 text-white-diamond uppercase tracking-tight">
            FINALIZAR <span className="text-gradient-gold">COMPRA</span>
          </h1>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-14 bg-carbon/50 p-4 border border-steel/20 rounded-none max-w-2xl mx-auto shadow-lg">
            {[
              { num: 1, label: 'Carrito', icon: Package },
              { num: 2, label: 'Envío', icon: Truck },
              { num: 3, label: 'Pago', icon: CreditCard },
            ].map((s, index) => (
              <div key={s.num} className="flex items-center gap-4">
                <button
                  onClick={() => s.num <= step && setStep(s.num)}
                  disabled={s.num > step}
                  className={`flex items-center gap-2 ${s.num <= step ? 'text-gold-action' : 'text-titanium'}`}
                >
                  <span className={`w-8 h-8 rounded-none flex items-center justify-center text-xs font-semibold transition-all ${
                    s.num < step ? 'bg-gold-action text-obsidian' :
                    s.num === step ? 'bg-gold-action text-obsidian ring-2 ring-gold-action/40' :
                    'bg-graphite text-titanium border border-steel/30'
                  }`}>
                    {s.num < step ? <CheckCircle className="w-4 h-4 text-obsidian" /> : s.num}
                  </span>
                  <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider">{s.label}</span>
                </button>
                {index < 2 && (
                  <div className={`w-12 h-[1px] transition-all ${s.num < step ? 'bg-gold-action' : 'bg-steel/30'}`} />
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
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    className="space-y-4"
                  >
                    <h2 className="text-sm font-display font-semibold uppercase tracking-widest text-white-diamond flex items-center gap-2 border-b border-steel/10 pb-3 mb-6">
                      <Package className="w-4 h-4 text-gold-action" />
                      Tu Carrito ({items.length} {items.length === 1 ? 'pieza' : 'piezas'})
                    </h2>
                    {items.map((item) => (
                      <div
                        key={`${item.product.id}-${item.selectedColor}`}
                        className="flex gap-4 p-4 rounded-none bg-carbon border border-steel/30 shadow-md"
                      >
                        <div className="relative w-20 h-20 rounded-none bg-graphite overflow-hidden border border-steel/30 shrink-0">
                          <Image
                            src={item.product.images?.[0] || '/images/placeholder-hat.jpg'}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-white-diamond truncate">{item.product.name}</h3>
                          <p className="text-xs text-titanium mt-1 font-light font-sans">
                            Color: {item.selectedColor} {item.selectedSize && `· Talla: ${item.selectedSize}`}
                          </p>
                          <p className="text-gold-action font-semibold text-sm mt-2 font-sans">
                            {formatPrice(item.product.price)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="p-1 text-titanium hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-none bg-graphite border border-steel/30 flex items-center justify-center hover:bg-gold-action hover:text-obsidian transition-colors text-chrome"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs text-white-diamond font-sans font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-none bg-graphite border border-steel/30 flex items-center justify-center hover:bg-gold-action hover:text-obsidian transition-colors text-chrome"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button onClick={() => setStep(2)} className="w-full btn-luxury py-6 text-xs uppercase tracking-[0.25em] font-semibold rounded-none mt-6">
                      Continuar con Envío
                    </Button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="shipping"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    className="space-y-6"
                  >
                    <h2 className="text-sm font-display font-semibold uppercase tracking-widest text-white-diamond flex items-center gap-2 border-b border-steel/10 pb-3 mb-6">
                      <Truck className="w-4 h-4 text-gold-action" />
                      Información de Envío
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2 space-y-1">
                        <Label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Nombre Completo *</Label>
                        <Input
                          value={shippingData.fullName}
                          onChange={(e) => setShippingData({ ...shippingData, fullName: e.target.value })}
                          className="bg-graphite border-steel/30 rounded-none text-white-diamond focus:border-gold-action h-12 text-sm placeholder:text-steel"
                          placeholder="Juan Pérez"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Email *</Label>
                        <Input
                          type="email"
                          value={shippingData.email}
                          onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                          className="bg-graphite border-steel/30 rounded-none text-white-diamond focus:border-gold-action h-12 text-sm placeholder:text-steel"
                          placeholder="tu@email.com"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Teléfono *</Label>
                        <Input
                          value={shippingData.phone}
                          onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                          className="bg-graphite border-steel/30 rounded-none text-white-diamond focus:border-gold-action h-12 text-sm placeholder:text-steel"
                          placeholder="+57 300 123 4567"
                          required
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <Label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Departamento *</Label>
                        <Select
                          value={selectedDepartment}
                          onValueChange={(value) => {
                            setSelectedDepartment(value);
                            setMunicipalities(departmentMunicipalities[value] || []);
                            setShippingData({ ...shippingData, city: '' });
                          }}
                        >
                          <SelectTrigger className="bg-graphite border-steel/30 rounded-none text-white-diamond focus:border-gold-action h-12 text-sm uppercase tracking-wider font-medium text-chrome">
                            <SelectValue placeholder="Selecciona tu departamento" />
                          </SelectTrigger>
                          <SelectContent className="bg-graphite border-steel/30 rounded-none text-xs uppercase tracking-wider font-medium">
                            {Object.keys(departmentMunicipalities).map((dept) => (
                              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <Label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Municipio *</Label>
                        <Select
                          value={shippingData.city}
                          onValueChange={(value) => setShippingData({ ...shippingData, city: value })}
                          disabled={!selectedDepartment}
                        >
                          <SelectTrigger className="bg-graphite border-steel/30 rounded-none text-white-diamond focus:border-gold-action h-12 text-sm uppercase tracking-wider font-medium text-chrome">
                            <SelectValue placeholder="Selecciona tu municipio" />
                          </SelectTrigger>
                          <SelectContent className="bg-graphite border-steel/30 rounded-none text-xs uppercase tracking-wider font-medium">
                            {municipalities.map((mun) => (
                              <SelectItem key={mun} value={mun}>{mun}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Código Postal</Label>
                        <Input
                          value={shippingData.postalCode}
                          onChange={(e) => setShippingData({ ...shippingData, postalCode: e.target.value })}
                          className="bg-graphite border-steel/30 rounded-none text-white-diamond focus:border-gold-action h-12 text-sm placeholder:text-steel"
                          placeholder="110111"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <Label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Dirección *</Label>
                        <Input
                          value={shippingData.address}
                          onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                          className="bg-graphite border-steel/30 rounded-none text-white-diamond focus:border-gold-action h-12 text-sm placeholder:text-steel"
                          placeholder="Calle 123 #45-67, Barrio, Apto 101"
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-6">
                      <h3 className="text-xs font-display font-semibold mb-4 flex items-center gap-2 uppercase tracking-widest text-white-diamond">
                        <MapPin className="w-4 h-4 text-gold-action" />
                        Método de Envío
                      </h3>
                      <RadioGroup value={selectedShipping} onValueChange={setSelectedShipping}>
                        <div className="space-y-3">
                          {shippingOptions.map((option) => (
                            <div
                              key={option.id}
                              className={`flex items-center justify-between p-4 rounded-none border cursor-pointer transition-all ${
                                selectedShipping === option.id
                                  ? 'border-gold-action bg-gold-action/10'
                                  : 'border-steel/30 bg-graphite/30 hover:border-gold-action/40'
                              }`}
                              onClick={() => setSelectedShipping(option.id)}
                            >
                              <div className="flex items-center gap-3">
                                <RadioGroupItem value={option.id} id={option.id} className="text-gold-action border-steel" />
                                <div>
                                  <p className="font-semibold text-sm text-white-diamond uppercase tracking-wider">{option.name}</p>
                                  <p className="text-xs text-titanium font-light">{option.days}</p>
                                </div>
                              </div>
                              <span className={`font-semibold text-sm ${option.price === 0 ? 'text-gold-action' : 'text-white-diamond'}`}>
                                {option.price === 0 ? 'Gratis' : formatPrice(option.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button variant="outline" onClick={() => setStep(1)} className="flex-1 border-steel/50 text-chrome hover:bg-graphite rounded-none text-xs uppercase tracking-widest font-semibold py-6">
                        Atrás
                      </Button>
                      <Button
                        onClick={() => setStep(3)}
                        className="flex-1 btn-luxury rounded-none text-xs uppercase tracking-widest font-semibold py-6"
                        disabled={!shippingData.city || !selectedShipping || !shippingData.fullName || !shippingData.email || !shippingData.phone || !shippingData.address}
                      >
                        Continuar
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    className="space-y-6"
                  >
                    <h2 className="text-sm font-display font-semibold uppercase tracking-widest text-white-diamond flex items-center gap-2 border-b border-steel/10 pb-3 mb-6">
                      <CreditCard className="w-4 h-4 text-gold-action" />
                      Método de Pago
                    </h2>

                    {/* Payment Method Selection */}
                    <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {paymentMethods.map((method) => (
                          <div
                            key={method.id}
                            className={`flex flex-col items-center p-5 rounded-none border cursor-pointer transition-all ${
                              selectedPayment === method.id
                                ? 'border-gold-action bg-gold-action/10'
                                : 'border-steel/30 bg-graphite/30 hover:border-gold-action/40'
                            }`}
                            onClick={() => setSelectedPayment(method.id)}
                          >
                            <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                            <method.icon className={`w-6 h-6 mb-3 ${selectedPayment === method.id ? 'text-gold-action' : 'text-chrome'}`} />
                            <p className="font-semibold text-xs uppercase tracking-wider text-white-diamond text-center mb-1">{method.name}</p>
                            <p className="text-[10px] text-titanium font-light text-center">{method.description}</p>
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
                        className="p-5 rounded-none border border-steel/30 bg-carbon space-y-4 shadow-xl"
                      >
                        <div className="space-y-1">
                          <Label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Número de Tarjeta</Label>
                          <Input
                            value={cardData.number}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').substring(0, 16)
                              const formatted = value.replace(/(\d{4})/g, '$1 ').trim()
                              setCardData({ ...cardData, number: formatted })
                            }}
                            className="bg-graphite border-steel/30 rounded-none text-white-diamond focus:border-gold-action h-12 text-sm font-mono placeholder:text-steel"
                            placeholder="1234 5678 9012 3456"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Nombre en la Tarjeta</Label>
                          <Input
                            value={cardData.holder}
                            onChange={(e) => setCardData({ ...cardData, holder: e.target.value.toUpperCase() })}
                            className="bg-graphite border-steel/30 rounded-none text-white-diamond focus:border-gold-action h-12 text-sm placeholder:text-steel"
                            placeholder="JUAN PEREZ"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Mes</Label>
                            <Select value={cardData.expMonth} onValueChange={(value) => setCardData({ ...cardData, expMonth: value })}>
                              <SelectTrigger className="bg-graphite border-steel/30 rounded-none text-white-diamond focus:border-gold-action h-12 text-xs font-semibold uppercase tracking-wider text-chrome">
                                <SelectValue placeholder="MM" />
                              </SelectTrigger>
                              <SelectContent className="bg-graphite border-steel/30 rounded-none text-xs font-semibold">
                                {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((month) => (
                                  <SelectItem key={month} value={month}>{month}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Año</Label>
                            <Select value={cardData.expYear} onValueChange={(value) => setCardData({ ...cardData, expYear: value })}>
                              <SelectTrigger className="bg-graphite border-steel/30 rounded-none text-white-diamond focus:border-gold-action h-12 text-xs font-semibold uppercase tracking-wider text-chrome">
                                <SelectValue placeholder="AA" />
                              </SelectTrigger>
                              <SelectContent className="bg-graphite border-steel/30 rounded-none text-xs font-semibold">
                                {Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() + i).slice(-2)).map((year) => (
                                  <SelectItem key={year} value={year}>{year}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">CVV</Label>
                            <Input
                              type="password"
                              value={cardData.cvc}
                              onChange={(e) => setCardData({ ...cardData, cvc: e.target.value.replace(/\D/g, '').substring(0, 4) })}
                              className="bg-graphite border-steel/30 rounded-none text-white-diamond focus:border-gold-action h-12 text-sm placeholder:text-steel"
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
                        className="p-5 rounded-none border border-steel/30 bg-carbon space-y-3 shadow-xl"
                      >
                        <Label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Número de Nequi</Label>
                        <Input
                          value={nequiPhone}
                          onChange={(e) => setNequiPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                          className="bg-graphite border-steel/30 rounded-none text-white-diamond focus:border-gold-action h-12 text-sm placeholder:text-steel"
                          placeholder="3001234567"
                        />
                        <p className="text-[10px] text-titanium mt-2 font-light">
                          Recibirás una notificación push en tu app Nequi para confirmar la transacción.
                        </p>
                      </motion.div>
                    )}

                    {/* PSE Info */}
                    {selectedPayment === 'PSE' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-5 rounded-none border border-steel/30 bg-graphite/40 shadow-xl"
                      >
                        <p className="text-xs text-titanium leading-relaxed font-light">
                          Serás redirigido de forma segura a la plataforma de PSE para autorizar el débito directo desde tu cuenta bancaria.
                        </p>
                      </motion.div>
                    )}

                    <div className="flex gap-4 pt-4">
                      <Button variant="outline" onClick={() => setStep(2)} className="flex-1 border-steel/50 text-chrome hover:bg-graphite rounded-none text-xs uppercase tracking-widest font-semibold py-6">
                        Atrás
                      </Button>
                      <Button
                        onClick={handleCompleteOrder}
                        disabled={isLoading}
                        className="flex-grow btn-luxury rounded-none text-xs uppercase tracking-widest font-semibold py-6"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-obsidian" />
                        ) : (
                          <>Pagar {formatPrice(finalTotal)}</>
                        )}
                      </Button>
                    </div>

                    {/* Security badges */}
                    <div className="flex items-center justify-center gap-6 pt-6 border-t border-steel/20">
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-titanium font-medium">
                        <CheckCircle className="w-4 h-4 text-gold-action" />
                        Pago 100% seguro
                      </div>
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-titanium font-medium">
                        <CreditCard className="w-4 h-4 text-chrome" />
                        Procesado por Wompi
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 p-6 bg-carbon border border-steel/30 rounded-none shadow-2xl">
                <h3 className="text-sm font-display font-semibold mb-6 uppercase tracking-wider text-white-diamond border-b border-steel/10 pb-3">Resumen de Compra</h3>

                <div className="space-y-4 mb-6 max-h-48 overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div
                      key={`summary-${item.product.id}`}
                      className="flex justify-between text-xs font-sans font-light"
                    >
                      <span className="text-titanium truncate max-w-[65%]">
                        {item.product.name} x{item.quantity}
                      </span>
                      <span className="text-white-diamond font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-steel/20 pt-4 space-y-2.5 text-xs font-sans font-light">
                  <div className="flex justify-between text-titanium">
                    <span>Subtotal</span>
                    <span className="text-white-diamond">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-titanium">
                    <span>Envío</span>
                    <span className="text-white-diamond">{shippingCost > 0 ? formatPrice(shippingCost) : selectedShipping === 'recoger' ? 'Gratis' : 'Por calcular'}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-xs text-gold-action">
                      <span>Descuento ({appliedPromo.code})</span>
                      <span>-{formatPrice(appliedPromo.discount)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-steel/20 mt-4 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase tracking-wider text-titanium font-semibold">Total</span>
                    <span className="text-xl font-bold text-gradient-gold">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mt-6 pt-6 border-t border-steel/20">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Código Promocional</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="bg-graphite border-steel/30 rounded-none text-white-diamond focus:border-gold-action h-11 text-xs placeholder:text-steel uppercase tracking-wider"
                      placeholder="LUXURY30"
                      disabled={!!appliedPromo}
                    />
                    <Button
                      variant="outline"
                      className="border-steel/50 hover:border-gold-action hover:text-gold-action rounded-none text-xs uppercase tracking-wider font-semibold shrink-0"
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
                      className="text-[10px] uppercase tracking-wider text-destructive mt-2.5 hover:underline font-semibold"
                    >
                      Remover código
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
