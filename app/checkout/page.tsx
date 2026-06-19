'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image';
import departmentsData from '../../departments.json';
import citiesData from '../../cities.json';
import Link from 'next/link';
import { useRouter } from 'next/navigation'
import { ArrowLeft, Truck, CreditCard, MapPin, CheckCircle, Minus, Plus, Trash2, Package, Loader2, Smartphone, Building2, Plus as PlusIcon } from 'lucide-react'
import { useCartStore, useAuthStore } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'
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

interface Address {
  id: string; full_name: string; street: string; city: string;
  state: string; country: string; postal_code: string; phone: string; is_default: boolean;
}

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
  const { user, isInitialized } = useAuthStore()
  const router = useRouter()
  const cartTotal = total()
  const hasInvalidItems = items.some(item => {
    const availableStock = item.selectedSize && item.product.sizes_stock 
      ? (item.product.sizes_stock[item.selectedSize] ?? 0) 
      : (item.product.stock ?? 0);
    return item.quantity > availableStock || availableStock <= 0;
  })
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

  const normalizeDigits = (value: string) => value.replace(/\D/g, '')
  const isValidEmail = (email: string) => email.trim() === '' ? false : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isValidPhone = (phone: string) => phone.trim() === '' ? false : /^\d{7,15}$/.test(normalizeDigits(phone))
  const isValidPostalCode = (postalCode: string) => postalCode.trim() === '' ? true : /^\d{4,10}$/.test(postalCode)
  
  const getEmailError = (email: string): string | null => {
    if (!email.trim()) return 'El correo es requerido'
    if (!isValidEmail(email)) return 'Formato de correo inválido (ej: ejemplo@correo.com)'
    return null
  }
  
  const getPhoneError = (phone: string): string | null => {
    if (!phone.trim()) return 'El teléfono es requerido'
    if (!isValidPhone(phone)) return 'Teléfono inválido (7-15 dígitos)'
    return null
  }
  
  const getPostalCodeError = (postalCode: string): string | null => {
    if (postalCode.trim() === '') return null
    if (!isValidPostalCode(postalCode)) return 'Código postal inválido (solo dígitos, 4-10 caracteres)'
    return null
  }

  const validateShippingInfo = (): boolean => {
    if (!shippingData.fullName.trim()) return false
    if (!shippingData.email.trim() || !isValidEmail(shippingData.email)) return false
    if (!shippingData.phone.trim() || !isValidPhone(shippingData.phone)) return false
    if (!selectedDepartment || !shippingData.city.trim()) return false
    if (!shippingData.address.trim()) return false
    if (!isValidPostalCode(shippingData.postalCode)) return false
    return true
  }

  const validateNewAddress = () => {
    if (!newAddress.full_name.trim() || !newAddress.street.trim() || !newAddress.city.trim() || !newAddress.state.trim() || !newAddress.postal_code.trim() || !newAddress.phone.trim()) {
      return false
    }
    if (!isValidPhone(newAddress.phone)) return false
    if (!isValidPostalCode(newAddress.postal_code)) return false
    return true
  }

  const [selectedShipping, setSelectedShipping] = useState('')
  const shippingCost = shippingOptions.find(s => s.id === selectedShipping)?.price || 0

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({
    full_name: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    phone: '',
  })

  useEffect(() => {
    if (isInitialized && !user && items.length > 0) {
      router.push('/auth/login?redirect=/checkout')
    }

    // Load user data and addresses
    if (user && isInitialized) {
      console.log('Loading user data for checkout, userId:', user.id)
      loadUserDataAndAddresses()
    }
  }, [isInitialized, user])

  const loadUserDataAndAddresses = async () => {
    if (!user) return
    
    try {
      const supabase = createClient()
      
      console.log('Fetching profile for user:', user.id)
      
      // Load profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      console.log('Profile data:', profile, 'Error:', profileError)

      if (profile) {
        console.log('Setting shipping data with profile:', profile)
        setShippingData(prev => ({
          ...prev,
          fullName: profile.full_name || '',
          email: profile.email || user.email || '',
          phone: profile.phone || '',
        }))
      }

      // Load addresses
      const { data: userAddresses, error: addressError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })

      console.log('Addresses data:', userAddresses, 'Error:', addressError)

      if (userAddresses && userAddresses.length > 0) {
        setAddresses(userAddresses as Address[])
        // Auto-select first or default address
        const defaultAddr = userAddresses.find((a: any) => a.is_default)
        const firstAddr = userAddresses[0]
        const addressToSelect = defaultAddr || firstAddr
        console.log('Auto-selecting address:', addressToSelect)
        setSelectedAddressId(addressToSelect.id)
        fillAddressData(addressToSelect)
      } else {
        console.log('No addresses found for user')
      }
    } catch (err) {
      console.error('Error loading user data:', err)
    }
  }

  const fillAddressData = (address: any) => {
    setSelectedDepartment(address.state || '')
    setMunicipalities(departmentMunicipalities[address.state] || [])
    setShippingData(prev => ({
      ...prev,
      city: address.city || '',
      address: address.street || '',
      phone: address.phone || prev.phone,
      postalCode: address.postal_code || '',
    }))
  }

  const handleAddressChange = (addressId: string) => {
    setSelectedAddressId(addressId)
    const selected = addresses.find(a => a.id === addressId)
    if (selected) {
      fillAddressData(selected)
    }
  }

  const handleSaveNewAddress = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para guardar una dirección')
      return
    }
    if (!validateNewAddress()) {
      toast.error('Por favor completa todos los campos con datos válidos')
      return
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('addresses').insert({
        user_id: user.id,
        ...newAddress,
        country: 'Colombia',
        is_default: addresses.length === 0,
      }).select().single()

      if (error) throw error

      setAddresses([...addresses, data as Address])
      fillAddressData(data)
      setSelectedAddressId(data.id)
      setShowNewAddressForm(false)
      setNewAddress({
        full_name: '',
        street: '',
        city: '',
        state: '',
        postal_code: '',
        phone: '',
      })
      toast.success('Dirección agregada')
    } catch (err) {
      console.error('Error saving address:', err)
      toast.error('Error al guardar la dirección')
    }
  }

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
    if (hasInvalidItems) {
      toast.error('Por favor corrige los productos sin stock en tu carrito.')
      setStep(1)
      return
    }

    if (!validateShippingInfo()) {
      toast.error('Por favor completa todos los campos de envío con datos válidos')
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
              Agrega camisetas, álbumes Panini o coleccionables oficiales para continuar.
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
                      Tu Carrito ({items.length} {items.length === 1 ? 'producto' : 'productos'})
                    </h2>
                    {items.map((item) => {
                      const availableStock = item.selectedSize && item.product.sizes_stock 
                        ? (item.product.sizes_stock[item.selectedSize] || 0) 
                        : (item.product.stock || 0);
                      const isOutOfStock = availableStock <= 0;
                      const isExceedingStock = item.quantity > availableStock;

                      return (
                        <div
                          key={item.id}
                          className={`flex gap-4 p-4 rounded-none bg-carbon border border-steel/30 shadow-md transition-all duration-300 ${
                            isOutOfStock || isExceedingStock ? 'opacity-40 grayscale' : ''
                          }`}
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
                            {isOutOfStock && (
                              <p className="text-[10px] text-red-500 font-semibold uppercase mt-1">
                                Agotado en esta talla
                              </p>
                            )}
                            {!isOutOfStock && isExceedingStock && (
                              <p className="text-[10px] text-amber-500 font-semibold uppercase mt-1">
                                Excede stock (Disp: {availableStock})
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end justify-between">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1 text-titanium hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-7 h-7 rounded-none bg-graphite border border-steel/30 flex items-center justify-center hover:bg-gold-action hover:text-obsidian transition-colors text-chrome"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-xs text-white-diamond font-sans font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => item.quantity < availableStock && updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= availableStock || isOutOfStock}
                                className={`w-7 h-7 rounded-none bg-graphite border border-steel/30 flex items-center justify-center transition-colors text-chrome ${item.quantity >= availableStock || isOutOfStock ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gold-action hover:text-obsidian'}`}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <Button 
                      onClick={() => setStep(2)} 
                      disabled={hasInvalidItems}
                      className={`w-full btn-luxury py-6 text-xs uppercase tracking-[0.25em] font-semibold rounded-none mt-6 ${
                        hasInvalidItems ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {hasInvalidItems ? 'Ajustar cantidades en carrito' : 'Continuar con Envío'}
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

                    {/* Saved Addresses Section */}
                    {addresses.length > 0 && (
                      <div className="bg-graphite/50 border border-steel/20 p-5 space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-titanium mb-2">Dirección guardada</p>
                        <div className="space-y-2">
                          {addresses.map(addr => (
                            <label key={addr.id} className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-steel/10 transition">
                              <input
                                type="radio"
                                name="address"
                                value={addr.id}
                                checked={selectedAddressId === addr.id}
                                onChange={() => handleAddressChange(addr.id)}
                                className="w-4 h-4 cursor-pointer"
                              />
                              <span className="text-xs text-white-diamond">
                                <strong>{addr.full_name}</strong> • {addr.street}, {addr.city} ({addr.state})
                              </span>
                            </label>
                          ))}
                        </div>
                        <button
                          onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                          className="text-xs uppercase tracking-wider text-gold-action font-semibold hover:underline flex items-center gap-1 mt-2"
                        >
                          <PlusIcon className="w-3 h-3" /> Agregar nueva dirección
                        </button>

                        {/* New Address Form */}
                        {showNewAddressForm && (
                          <div className="mt-4 p-4 bg-steel/10 border border-steel/20 space-y-3">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-white-diamond">Nueva Dirección</h3>
                            <div className="grid grid-cols-1 gap-3">
                              <Input
                                placeholder="Nombre completo"
                                value={newAddress.full_name}
                                onChange={(e) => setNewAddress({...newAddress, full_name: e.target.value})}
                                className="bg-graphite border-steel/30 rounded-none text-white-diamond focus:border-gold-action h-10 text-xs"
                              />
                              <Input
                                placeholder="Calle y número"
                                value={newAddress.street}
                                onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                                className="bg-graphite border-steel/30 rounded-none text-white-diamond focus:border-gold-action h-10 text-xs"
                              />
                              <Select
                                value={newAddress.state}
                                onValueChange={(value) => setNewAddress({...newAddress, state: value})}
                              >
                                <SelectTrigger className="bg-graphite border-steel/30 rounded-none text-white-diamond focus:border-gold-action h-10 text-xs">
                                  <SelectValue placeholder="Departamento" />
                                </SelectTrigger>
                                <SelectContent className="bg-graphite border-steel/30 rounded-none text-xs">
                                  {departmentsData?.data.map((dept: { id: number; name: string }) => (
                                    <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Input
                                placeholder="Ciudad"
                                value={newAddress.city}
                                onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                                className="bg-graphite border-steel/30 rounded-none text-white-diamond focus:border-gold-action h-10 text-xs"
                              />
                              <Input
                                placeholder="Código postal"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={newAddress.postal_code}
                                onChange={(e) => setNewAddress({...newAddress, postal_code: e.target.value})}
                                className="bg-graphite border-steel/30 rounded-none text-white-diamond focus:border-gold-action h-10 text-xs"
                              />
                              <Input
                                placeholder="Teléfono"
                                type="tel"
                                inputMode="tel"
                                value={newAddress.phone}
                                onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                                className="bg-graphite border-steel/30 rounded-none text-white-diamond focus:border-gold-action h-10 text-xs"
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={handleSaveNewAddress}
                                  className="btn-luxury rounded-none text-xs uppercase flex-1"
                                  disabled={!validateNewAddress()}
                                >
                                  Guardar
                                </Button>
                                <Button
                                  onClick={() => setShowNewAddressForm(false)}
                                  variant="outline"
                                  className="rounded-none text-xs uppercase flex-1"
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

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
                          className={`bg-graphite border rounded-none text-white-diamond focus:border-gold-action h-12 text-sm placeholder:text-steel ${
                            shippingData.email.trim() && getEmailError(shippingData.email)
                              ? 'border-destructive focus:border-destructive'
                              : 'border-steel/30'
                          }`}
                          placeholder="tu@email.com"
                          required
                        />
                        {shippingData.email.trim() && getEmailError(shippingData.email) && (
                          <p className="text-xs text-destructive mt-1">{getEmailError(shippingData.email)}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Teléfono *</Label>
                        <Input
                          type="tel"
                          inputMode="tel"
                          value={shippingData.phone}
                          onChange={(e) => {
                            const digits = normalizeDigits(e.target.value)
                            setShippingData({ ...shippingData, phone: digits })
                          }}
                          maxLength={15}
                          className={`bg-graphite border rounded-none text-white-diamond focus:border-gold-action h-12 text-sm placeholder:text-steel ${
                            shippingData.phone.trim() && getPhoneError(shippingData.phone)
                              ? 'border-destructive focus:border-destructive'
                              : 'border-steel/30'
                          }`}
                          placeholder="3001234567"
                          required
                        />
                        {shippingData.phone.trim() && getPhoneError(shippingData.phone) && (
                          <p className="text-xs text-destructive mt-1">{getPhoneError(shippingData.phone)}</p>
                        )}
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
                          inputMode="numeric"
                          value={shippingData.postalCode}
                          onChange={(e) => {
                            const digits = normalizeDigits(e.target.value)
                            setShippingData({ ...shippingData, postalCode: digits })
                          }}
                          maxLength={10}
                          className={`bg-graphite border rounded-none text-white-diamond focus:border-gold-action h-12 text-sm placeholder:text-steel ${
                            shippingData.postalCode.trim() && getPostalCodeError(shippingData.postalCode)
                              ? 'border-destructive focus:border-destructive'
                              : 'border-steel/30'
                          }`}
                          placeholder="110111"
                        />
                        {shippingData.postalCode.trim() && getPostalCodeError(shippingData.postalCode) && (
                          <p className="text-xs text-destructive mt-1">{getPostalCodeError(shippingData.postalCode)}</p>
                        )}
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
                        disabled={!validateShippingInfo() || !selectedShipping}
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
                    {/* Shipping Summary */}
                    <div className="bg-graphite/40 border border-steel/30 rounded-none p-5 shadow-lg">
                      <h3 className="text-xs font-display font-semibold uppercase tracking-widest text-white-diamond flex items-center gap-2 mb-4 pb-3 border-b border-steel/20">
                        <Truck className="w-4 h-4 text-gold-action" />
                        Resumen de Envío
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-3">
                          <div>
                            <p className="text-titanium font-light">Nombre</p>
                            <p className="text-white-diamond font-semibold">{shippingData.fullName}</p>
                          </div>
                          <div>
                            <p className="text-titanium font-light">Teléfono</p>
                            <p className="text-white-diamond font-semibold">{shippingData.phone}</p>
                          </div>
                          <div>
                            <p className="text-titanium font-light">Email</p>
                            <p className="text-white-diamond font-semibold break-all">{shippingData.email}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-titanium font-light">Dirección</p>
                            <p className="text-white-diamond font-semibold">{shippingData.address}</p>
                          </div>
                          <div>
                            <p className="text-titanium font-light">Ubicación</p>
                            <p className="text-white-diamond font-semibold">{shippingData.city}, {selectedDepartment}</p>
                          </div>
                          {shippingData.postalCode && (
                            <div>
                              <p className="text-titanium font-light">Código Postal</p>
                              <p className="text-white-diamond font-semibold">{shippingData.postalCode}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="border-t border-steel/20 mt-4 pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-titanium font-light text-xs">Método de Envío</p>
                            <p className="text-white-diamond font-semibold">{shippingOptions.find(opt => opt.id === selectedShipping)?.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-titanium font-light text-xs">Costo de Envío</p>
                            <p className={`font-semibold ${shippingCost === 0 ? 'text-gold-action' : 'text-white-diamond'}`}>
                              {shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

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
                        className="flex-grow rounded-none text-xs uppercase tracking-[0.2em] font-bold py-6 text-white border-none shadow-lg transition-transform hover:scale-[1.02]"
                        style={{ background: 'linear-gradient(90deg, #FCD116 0%, #003893 50%, #CE1126 100%)' }}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <span className="drop-shadow-md flex items-center gap-2">⚽ Pagar {formatPrice(finalTotal)}</span>
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

               
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
