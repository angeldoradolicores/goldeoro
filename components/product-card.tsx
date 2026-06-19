'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Heart, Eye } from 'lucide-react'
import SparklesUI from './sparkles'
import { useCartStore, useFavoritesStore } from '@/lib/store'
import { toast } from 'sonner'
import { useState } from 'react'
import { BackgroundGradient } from './ui/background-gradient'

export interface Product {
  id: string
  name: string
  slug?: string
  description: string
  price: number
  original_price?: number | null
  category: string
  category_slug?: string
  stock: number
  featured: boolean
  is_promotion?: boolean
  images: string[]
  videos?: string[]
  colors: string[]
  sizes: string[]
  created_at?: string
}

interface ProductCardProps {
  product: Product
  index?: number
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price)
}

// Badge tricolor
function MetalBadge({ text, variant = 'gold' }: { text: string; variant?: 'gold' | 'chrome' | 'crimson' }) {
  const styles = {
    gold: {
      background: '#FCD116',
      border: '1px solid #FCD116',
      color: '#111827',
    },
    chrome: {
      background: 'rgba(0, 56, 147, 0.2)',
      border: '1px solid rgba(0, 56, 147, 0.5)',
      color: '#DDE8F5',
    },
    crimson: {
      background: 'rgba(206, 17, 38, 0.2)',
      border: '1px solid rgba(206, 17, 38, 0.5)',
      color: '#FFD1D1',
    },
  }
  return (
    <span
      className="inline-block px-2.5 py-1 text-[9px] font-black uppercase"
      style={{
        fontFamily: 'var(--font-sans)',
        letterSpacing: '0.18em',
        ...styles[variant],
      }}
    >
      {text}
    </span>
  )
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore(state => state.addItem)
  const toggleFavorite = useFavoritesStore(state => state.toggleFavorite)
  const router = useRouter()
  const isWishlisted = useFavoritesStore(state => state.items.some(i => i.id === product.id))
  const [isHovered, setIsHovered] = useState(false)

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product as any, product.colors?.[0] || '', product.sizes?.[0] || '', 1)
    toast.success('Agregado al carrito', { description: product.name })
  }

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const wasWishlisted = isWishlisted
    await toggleFavorite(product as any)
    if (!wasWishlisted) {
      toast.success('Agregado a favoritos')
    } else {
      toast.info('Eliminado de favoritos')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group h-full"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <BackgroundGradient containerClassName="h-full" className="rounded-[22px] bg-[#080b11] h-full overflow-hidden">
        <div
          role="link"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              router.push(`/producto/${product.slug || product.id}`)
            }
          }}
          onClick={() => router.push(`/producto/${product.slug || product.id}`)}
          className="h-full flex flex-col"
        >
          <div
            className="relative overflow-hidden transition-all duration-500"
            style={{
              background: '#080b11',
              backgroundImage: `
              radial-gradient(circle at top right, rgba(252,209,22,0.05) 0%, transparent 40%),
              radial-gradient(circle at bottom left, rgba(0,56,147,0.05) 0%, transparent 40%),
              radial-gradient(circle at bottom right, rgba(206,17,38,0.05) 0%, transparent 40%)
            `,
              border: product.featured || product.is_promotion ? '1px solid rgba(200,164,77,0.35)' : (isHovered ? '1px solid rgba(252,209,22,0.2)' : '1px solid #262626'),
              boxShadow: product.featured || product.is_promotion
                ? '0 28px 68px rgba(200,164,77,0.06), 0 6px 20px rgba(0,0,0,0.6)'
                : isHovered
                  ? '0 20px 48px rgba(0,0,0,0.75), 0 0 0 1px rgba(252,209,22,0.15), 0 0 30px rgba(0,56,147,0.1)'
                  : '0 4px 16px rgba(0,0,0,0.4)',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden" style={{ background: '#171717' }}>
              <Image
                src={(product.images || []).find(Boolean) || '/images/placeholder-hat.jpg'}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-opacity duration-300"
                style={{
                  opacity: isHovered ? 0.9 : 1,
                }}
                loading={index < 6 ? 'eager' : 'lazy'}
                priority={index < 4}
              />

              {/* Overlay gradiente al hover */}
              <div
                className="absolute inset-0 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(to top, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.2) 40%, transparent 70%)',
                  opacity: isHovered ? 1 : 0,
                }}
              />

              {/* Sparkles + shimmer overlay */}
              <SparklesUI extra={isHovered ? 2 : 0} />
              <div className="reflect-shimmer" />

              {/* Reflejo satinado superior */}
              <div
                className="absolute top-0 left-0 right-0"
                style={{
                  height: '40%',
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.03) 0%, transparent 100%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.stock === 0 && (
                  <MetalBadge text="Agotado" variant="chrome" />
                )}
                {product.is_promotion && discount > 0 && (
                  <MetalBadge text={`-${discount}%`} variant="crimson" />
                )}
                {product.featured && product.stock > 0 && (
                  <MetalBadge text="Exclusivo" variant="gold" />
                )}
                {product.stock > 0 && product.stock < 5 && (
                  <MetalBadge text={`Últimas ${product.stock}`} variant="crimson" />
                )}
              </div>

              {/* Quick Actions (derecha) */}
              <div
                className="absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300"
                style={{ opacity: isHovered ? 1 : 0, transform: isHovered ? 'translateX(0)' : 'translateX(8px)' }}
              >
                <button
                  onClick={handleWishlist}
                  className="w-9 h-9 flex items-center justify-center transition-all duration-200"
                  style={{
                    background: 'rgba(13,13,13,0.85)',
                    backdropFilter: 'blur(8px)',
                    border: isWishlisted ? '1px solid rgba(221,232,245,0.25)' : '1px solid #333',
                    color: isWishlisted ? '#DDE8F5' : '#8B8B8B',
                  }}
                >
                  <Heart className="w-4 h-4" style={{ fill: isWishlisted ? 'currentColor' : 'none' }} />
                </button>
                <button
                  className="w-9 h-9 flex items-center justify-center transition-all duration-200"
                  style={{
                    background: 'rgba(13,13,13,0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid #333',
                    color: '#8B8B8B',
                  }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    window.location.href = `/producto/${product.slug || product.id}`
                  }}
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart (bottom — always visible on mobile, hover on desktop) */}
              <div
                className="absolute bottom-0 left-0 right-0 transition-all duration-400"
                style={{
                  opacity: isHovered ? 1 : undefined,
                  transform: isHovered ? 'translateY(0)' : undefined,
                }}
              >
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full py-2.5 md:py-3.5 flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-bold uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed md:opacity-0 md:translate-y-3 group-hover:opacity-100 group-hover:translate-y-0"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    letterSpacing: '0.2em',
                    background: product.stock === 0
                      ? 'rgba(38,38,38,0.95)'
                      : 'linear-gradient(135deg, #C9CDD2 0%, #DDE8F5 100%)',
                    color: product.stock === 0 ? '#8B8B8B' : '#050505',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <ShoppingBag className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  <span className="hidden sm:inline">{product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}</span>
                  <span className="sm:hidden">{product.stock === 0 ? 'Agotado' : 'Agregar'}</span>
                </button>
              </div>
            </div>



            {/* Content */}
            <div className="p-3 md:p-4 pb-4 md:pb-5">
              {/* Category */}
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/catalogo?category=${encodeURIComponent(product.category_slug || product.category)}`)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    e.stopPropagation()
                    router.push(`/catalogo?category=${encodeURIComponent(product.category_slug || product.category)}`)
                  }
                }}
                className="inline-block mb-2"
                style={{ cursor: 'pointer' }}
              >
                <span
                  className="text-[9px] font-semibold uppercase block mb-2"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    letterSpacing: '0.3em',
                    color: '#8B8B8B',
                  }}
                >
                  {product.category}
                </span>
              </span>

              {/* Name */}
              <h3
                className="font-semibold text-xs md:text-sm mb-2 md:mb-3 leading-snug transition-colors duration-300 line-clamp-2"
                style={{
                  fontFamily: 'var(--font-cinzel)',
                  color: isHovered ? '#F5F5F5' : '#C0C0C0',
                  letterSpacing: '0.04em',
                }}
              >
                {product.name}
              </h3>

              {/* Colors */}
              {product.colors?.length > 0 && (
                <div className="flex items-center gap-1.5 mb-3">
                  {product.colors.slice(0, 5).map((color, i) => (
                    <span
                      key={i}
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: getColorHex(color),
                        border: '1px solid rgba(255,255,255,0.15)',
                      }}
                      title={color}
                    />
                  ))}
                  {product.colors?.length > 5 && (
                    <span className="text-[10px]" style={{ color: '#8B8B8B' }}>
                      +{product.colors.length - 5}
                    </span>
                  )}
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-1.5 md:gap-2.5">
                <span
                  className="text-sm md:text-base font-bold"
                  style={{
                    fontFamily: 'var(--font-cinzel)',
                    background: 'linear-gradient(135deg, #C9CDD2, #DDE8F5)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {formatPrice(product.price)}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span
                    className="text-xs line-through"
                    style={{ color: '#555' }}
                  >
                    {formatPrice(product.original_price)}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom separator / highlight bar */}
            <div
              className="absolute bottom-0 left-0 right-0 h-px transition-all duration-500"
              style={{
                background: isHovered
                  ? 'linear-gradient(to right, transparent, rgba(200,164,77,0.5), transparent)'
                  : 'linear-gradient(to right, transparent, rgba(38,38,38,0.8), transparent)',
              }}
            />
          </div>
        </div>
      </BackgroundGradient>
    </motion.div>
  )
}

function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    'Negro': '#1a1a1a',
    'Blanco': '#f5f5f5',
    'Rojo': '#991b1b',
    'Azul': '#1e3a5f',
    'Verde': '#14532d',
    'Amarillo': '#ca8a04',
    'Naranja': '#c2410c',
    'Morado': '#581c87',
    'Rosa': '#9d174d',
    'Gris': '#6b7280',
    'Cafe': '#78350f',
    'Beige': '#d4a574',
    'Celeste': '#164e63',
    'Navy': '#1e3a5f',
    'Vinotinto': '#7c2d12',
    'Dorado': '#b08d57',
    'Plateado': '#8b8b8b',
  }
  return colorMap[colorName] || '#4b5563'
}

interface ProductGridProps {
  products: Product[]
  className?: string
}

export function ProductGrid({ products, className = '' }: ProductGridProps) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 ${className}`}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  )
}
