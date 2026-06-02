'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Star, Heart, Eye, Sparkles } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState } from 'react'

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  original_price: number | null
  category: string
  stock: number
  featured: boolean
  is_promotion: boolean
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

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCartStore()
  const [isHovered, setIsHovered] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    addItem(product, product.colors[0] || 'Negro', product.sizes[0] || 'M')
    toast.success(`${product.name} agregado al carrito`, {
      icon: <ShoppingBag className="w-4 h-4" />,
    })
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
    toast.success(isWishlisted ? 'Removido de favoritos' : 'Agregado a favoritos')
  }

  const discount = product.original_price 
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/producto/${product.slug}`}>
        <div 
          className="relative rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-all duration-500 hover-lift"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={product.images[0] || '/images/placeholder-hat.jpg'}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.is_promotion && discount > 0 && (
                <motion.span
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="px-3 py-1 bg-neon-pink text-primary-foreground text-xs font-bold rounded-full shadow-lg glow-pink"
                >
                  -{discount}%
                </motion.span>
              )}
              {product.featured && (
                <motion.span
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="px-3 py-1 bg-neon-cyan text-primary-foreground text-xs font-bold rounded-full flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Featured
                </motion.span>
              )}
              {product.stock < 5 && product.stock > 0 && (
                <motion.span
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="px-3 py-1 bg-neon-orange text-primary-foreground text-xs font-bold rounded-full"
                >
                  Ultimas {product.stock}!
                </motion.span>
              )}
            </div>
            
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
              transition={{ duration: 0.3 }}
              className="absolute top-3 right-3 flex flex-col gap-2"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleWishlist}
                className={`w-10 h-10 rounded-full glass flex items-center justify-center transition-colors ${
                  isWishlisted ? 'text-neon-pink' : 'text-foreground/70 hover:text-neon-pink'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </motion.button>
              <Link href={`/producto/${product.slug}`}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center text-foreground/70 hover:text-neon-cyan transition-colors"
                >
                  <Eye className="w-5 h-5" />
                </motion.div>
              </Link>
            </motion.div>
            
            {/* Add to Cart Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="absolute bottom-4 left-4 right-4"
            >
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full btn-luxury py-6 text-sm"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                {product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
              </Button>
            </motion.div>
          </div>
          
          {/* Content */}
          <div className="p-4">
            {/* Category */}
            <span className="text-xs font-semibold uppercase tracking-wider text-neon-cyan">
              {product.category}
            </span>
            
            {/* Name */}
            <h3 className="font-bold text-lg mt-1 mb-2 group-hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>
            
            {/* Rating - Static for demo */}
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < 4 ? 'text-neon-yellow fill-current' : 'text-muted-foreground/30'}`}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">(128)</span>
            </div>
            
            {/* Colors */}
            {product.colors.length > 0 && (
              <div className="flex items-center gap-1 mb-3">
                {product.colors.slice(0, 4).map((color, i) => (
                  <span
                    key={i}
                    className="w-4 h-4 rounded-full border border-border/50"
                    style={{ 
                      backgroundColor: getColorHex(color),
                    }}
                    title={color}
                  />
                ))}
                {product.colors.length > 4 && (
                  <span className="text-xs text-muted-foreground">
                    +{product.colors.length - 4}
                  </span>
                )}
              </div>
            )}
            
            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-xl font-black text-neon-pink">
                {formatPrice(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    'Negro': '#1a1a1a',
    'Blanco': '#ffffff',
    'Rojo': '#ef4444',
    'Azul': '#3b82f6',
    'Verde': '#22c55e',
    'Amarillo': '#eab308',
    'Naranja': '#f97316',
    'Morado': '#a855f7',
    'Rosa': '#ec4899',
    'Gris': '#6b7280',
    'Cafe': '#92400e',
    'Beige': '#d4a574',
    'Celeste': '#67e8f9',
    'Navy': '#1e3a5f',
    'Vinotinto': '#7c2d12',
    'Dorado': '#d4af37',
    'Plateado': '#c0c0c0',
  }
  return colorMap[colorName] || '#6b7280'
}

interface ProductGridProps {
  products: Product[]
  className?: string
}

export function ProductGrid({ products, className = '' }: ProductGridProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  )
}
