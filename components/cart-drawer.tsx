'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCartStore, useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price)
}

export function CartDrawer() {
  const { items, isOpen, setCartOpen, removeItem, updateQuantity, total, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const router = useRouter()
  const cartTotal = total()
  const hasInvalidItems = items.some(item => {
    const availableStock = item.selectedSize && item.product.sizes_stock 
      ? (item.product.sizes_stock[item.selectedSize] ?? 0) 
      : (item.product.stock ?? 0);
    return item.quantity > availableStock || availableStock <= 0;
  })

  const handleCheckout = () => {
    setCartOpen(false)
    if (!user) {
      router.push('/auth/login?redirect=/checkout')
      return
    }
    router.push('/checkout')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(5,5,5,0.75)', backdropFilter: 'blur(8px)' }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 260 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 flex flex-col"
            style={{
              background: 'rgba(10,10,10,0.97)',
              backdropFilter: 'blur(32px)',
              borderLeft: '1px solid #1a1a1a',
            }}
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(to right, transparent, rgba(221,232,245,0.35), transparent)' }}
            />

            {/* Header */}
            <div
              className="flex items-center justify-between px-7 py-5"
              style={{ borderBottom: '1px solid #1a1a1a' }}
            >
              <div className="flex items-center gap-4">
                <ShoppingBag
                  style={{ width: '18px', height: '18px', color: '#DDE8F5' }}
                />
                <div>
                  <h2
                    className="text-sm font-bold tracking-[0.2em] uppercase text-white"
                    style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.2em' }}
                  >
                    Tu Carrito
                  </h2>
                  {items.length > 0 && (
                    <p
                      className="text-[10px] mt-0.5 uppercase tracking-[0.2em]"
                      style={{ fontFamily: 'var(--font-sans)', color: '#8B8B8B', letterSpacing: '0.2em' }}
                    >
                      {items.length} {items.length === 1 ? 'artículo' : 'artículos'}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="w-8 h-8 flex items-center justify-center transition-all duration-200"
                style={{
                  border: '1px solid #262626',
                  color: '#8B8B8B',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#C0C0C0'
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#F5F5F5'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#262626'
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#8B8B8B'
                }}
              >
                <X style={{ width: '14px', height: '14px' }} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-7 py-5">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <div
                    className="w-16 h-16 flex items-center justify-center mb-6"
                    style={{ border: '1px solid #262626' }}
                  >
                    <ShoppingBag style={{ width: '24px', height: '24px', color: '#333' }} />
                  </div>
                  <h3
                    className="text-sm font-semibold mb-2 tracking-[0.1em] uppercase"
                    style={{ fontFamily: 'var(--font-cinzel)', color: '#8B8B8B' }}
                  >
                    Carrito Vacío
                  </h3>
                  <p
                    className="text-xs mb-8 leading-relaxed"
                    style={{ fontFamily: 'var(--font-sans)', color: '#555', maxWidth: '200px' }}
                  >
                    Descubre nuestra colección y agrega tus piezas favoritas
                  </p>
                  <button
                    onClick={() => {
                      setCartOpen(false)
                      router.push('/catalogo')
                    }}
                    className="px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      background: '#FCD116',
                      color: '#111827',
                      letterSpacing: '0.2em',
                    }}
                  >
                    Explorar Colección
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <AnimatePresence>
                    {items.map((item, index) => {
                      const availableStock = item.selectedSize && item.product.sizes_stock 
                        ? (item.product.sizes_stock[item.selectedSize] || 0) 
                        : (item.product.stock || 0);
                      const isOutOfStock = availableStock <= 0;
                      const isExceedingStock = item.quantity > availableStock;

                      return (
                        <motion.div
                          key={item.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 60 }}
                        transition={{ delay: index * 0.04, duration: 0.3 }}
                        className={`flex gap-4 py-5 transition-all duration-300 ${isOutOfStock || isExceedingStock ? 'opacity-40 grayscale' : ''}`}
                        style={{ borderBottom: '1px solid #1a1a1a' }}
                      >
                        {/* Image */}
                        <div
                          className="relative w-[72px] h-[72px] shrink-0 overflow-hidden"
                          style={{ background: '#171717', border: '1px solid #262626' }}
                        >
                          <Image
                            src={item.product.images?.[0] || '/images/placeholder-hat.jpg'}
                            alt={item.product.name}
                            fill
                            sizes="72px"
                            className="object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h4
                            className="text-xs font-semibold leading-tight mb-1 truncate"
                            style={{ fontFamily: 'var(--font-cinzel)', color: '#C0C0C0', letterSpacing: '0.04em' }}
                          >
                            {item.product.name}
                          </h4>
                          {item.selectedColor && (
                            <p
                              className="text-[10px] uppercase tracking-[0.15em] mb-1"
                              style={{ fontFamily: 'var(--font-sans)', color: '#555', letterSpacing: '0.15em' }}
                            >
                              Color: {item.selectedColor}
                            </p>
                          )}
                          {item.selectedSize && (
                            <p
                              className="text-[10px] uppercase tracking-[0.15em] mb-2"
                              style={{ fontFamily: 'var(--font-sans)', color: '#555', letterSpacing: '0.15em' }}
                            >
                              Talla: {item.selectedSize}
                            </p>
                          )}
                          <p
                            className="text-xs font-bold"
                            style={{
                              fontFamily: 'var(--font-cinzel)',
                              color: '#FCD116',
                            }}
                          >
                            {formatPrice(item.product.price)}
                          </p>
                          {isOutOfStock && (
                            <p className="text-[10px] text-red-500 font-semibold uppercase mt-1 tracking-wider">
                              Agotado en esta talla
                            </p>
                          )}
                          {!isOutOfStock && isExceedingStock && (
                            <p className="text-[10px] text-amber-500 font-semibold uppercase mt-1 tracking-wider">
                              Excede stock (Disp: {availableStock})
                            </p>
                          )}
                        </div>

                        {/* Quantity & Remove */}
                        <div className="flex flex-col items-end justify-between">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="transition-colors duration-200"
                            style={{ color: '#333' }}
                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#F87171'}
                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#333'}
                          >
                            <Trash2 style={{ width: '12px', height: '12px' }} />
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center transition-all duration-200"
                              style={{ border: '1px solid #262626', color: '#8B8B8B' }}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(221,232,245,0.35)'
                                ;(e.currentTarget as HTMLButtonElement).style.color = '#DDE8F5'
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.borderColor = '#262626'
                                ;(e.currentTarget as HTMLButtonElement).style.color = '#8B8B8B'
                              }}
                            >
                              <Minus style={{ width: '10px', height: '10px' }} />
                            </button>
                            <span
                              className="w-6 text-center text-xs font-medium"
                              style={{ fontFamily: 'var(--font-sans)', color: '#F5F5F5' }}
                            >
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => item.quantity < availableStock && updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= availableStock}
                              className={`w-6 h-6 flex items-center justify-center transition-all duration-200 ${item.quantity >= availableStock ? 'opacity-40 cursor-not-allowed' : ''}`}
                              style={{ border: '1px solid #262626', color: '#8B8B8B' }}
                              onMouseEnter={e => {
                                if (item.quantity < availableStock) {
                                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(221,232,245,0.35)'
                                  ;(e.currentTarget as HTMLButtonElement).style.color = '#DDE8F5'
                                }
                              }}
                              onMouseLeave={e => {
                                if (item.quantity < availableStock) {
                                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#262626'
                                  ;(e.currentTarget as HTMLButtonElement).style.color = '#8B8B8B'
                                }
                              }}
                            >
                              <Plus style={{ width: '10px', height: '10px' }} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div
                className="px-7 py-6"
                style={{ borderTop: '1px solid #1a1a1a' }}
              >
                {/* Pricing breakdown */}
                <div className="space-y-2 mb-5">
                  <div className="flex justify-between">
                    <span
                      className="text-[11px] uppercase tracking-[0.15em]"
                      style={{ fontFamily: 'var(--font-sans)', color: '#8B8B8B' }}
                    >
                      Subtotal
                    </span>
                    <span
                      className="text-[11px]"
                      style={{ fontFamily: 'var(--font-sans)', color: '#C0C0C0' }}
                    >
                      {formatPrice(cartTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className="text-[11px] uppercase tracking-[0.15em]"
                      style={{ fontFamily: 'var(--font-sans)', color: '#8B8B8B' }}
                    >
                      Envío
                    </span>
                    <span
                      className="text-[11px]"
                      style={{ fontFamily: 'var(--font-sans)', color: '#DDE8F5' }}
                    >
                      Se calcula al finalizar
                    </span>
                  </div>
                </div>

                {/* Separador dorado */}
                <div
                  className="mb-5"
                  style={{
                    height: '1px',
                    background: 'linear-gradient(to right, transparent, rgba(221,232,245,0.4), transparent)',
                  }}
                />

                {/* Total */}
                <div className="flex justify-between items-center mb-6">
                  <span
                    className="text-xs font-semibold uppercase tracking-[0.2em]"
                    style={{ fontFamily: 'var(--font-sans)', color: '#8B8B8B' }}
                  >
                    Total
                  </span>
                  <span
                    className="text-lg font-black"
                    style={{
                      fontFamily: 'var(--font-cinzel)',
                      color: '#FCD116',
                    }}
                  >
                    {formatPrice(cartTotal)}
                  </span>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    disabled={hasInvalidItems}
                    className={`group w-full py-4 flex items-center justify-center gap-3 text-[11px] font-bold uppercase transition-all duration-300 shadow-lg text-white ${
                      hasInvalidItems ? 'opacity-40 cursor-not-allowed filter grayscale' : ''
                    }`}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      letterSpacing: '0.2em',
                      background: 'linear-gradient(90deg, #FCD116 0%, #003893 50%, #CE1126 100%)',
                      border: 'none',
                    }}
                    onMouseEnter={e => {
                      if (!hasInvalidItems) {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!hasInvalidItems) {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
                      }
                    }}
                  >
                    <span className="drop-shadow-md flex items-center gap-2">
                      {hasInvalidItems ? '⚠️ Ajustar cantidades' : '⚽ Finalizar Compra'}
                    </span>
                    {!hasInvalidItems && (
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform drop-shadow-md" />
                    )}
                  </button>

                  <button
                    onClick={clearCart}
                    className="w-full py-3 text-[10px] font-semibold uppercase tracking-[0.2em] transition-all duration-200"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      border: '1px solid #262626',
                      color: '#555',
                      letterSpacing: '0.2em',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = '#8B8B8B'
                      ;(e.currentTarget as HTMLButtonElement).style.color = '#8B8B8B'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = '#262626'
                      ;(e.currentTarget as HTMLButtonElement).style.color = '#555'
                    }}
                  >
                    Vaciar Carrito
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
