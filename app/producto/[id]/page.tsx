'use client'

import { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag, Heart, Share2, Truck, Shield, RotateCcw, Minus, Plus, Check, Loader2 } from 'lucide-react'
import { useCartStore, useFavoritesStore } from '@/lib/store'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ChatBot } from '@/components/chatbot'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  original_price?: number
  originalPrice?: number
  category: string
  stock: number
  featured: boolean
  is_promotion?: boolean
  isPromotion?: boolean
  images: string[]
  videos: string[]
  colors: string[]
  sizes: string[]
  sizes_stock?: Record<string, number>
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price)
}

export default function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)

  const getImageIndexForColor = (color: string, product: Product) => {
    if (!product || !product.colors || !product.images) return 0
    const colorIndex = product.colors.findIndex(
      (itemColor) => itemColor.toLowerCase() === color.toLowerCase()
    )
    if (colorIndex >= 0 && colorIndex < product.images.length) {
      return colorIndex
    }
    return 0
  }
  const addItem = useCartStore(state => state.addItem)
  const toggleFavorite = useFavoritesStore(state => state.toggleFavorite)
  const cartItems = useCartStore(state => state.items)
  const favoriteItems = useFavoritesStore(state => state.items)
  const isFav = product ? favoriteItems.some(i => i.id === product.id) : false

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(id)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.product) {
            setProduct(data.product)
            const initialColor = data.product.colors?.[0] || ''
            setSelectedColor(initialColor)
            setSelectedImage(getImageIndexForColor(initialColor, data.product))
            
            const initialSize = data.product.sizes?.[0] || ''
            setSelectedSize(initialSize)
            
            const catParam = encodeURIComponent(data.product.category || '')
            const related = await fetch(`/api/products?category=${catParam}&limit=5`)
            if (related.ok) {
              const relatedData = await related.json()
              setRelatedProducts((Array.isArray(relatedData) ? relatedData : []).filter((p: Product) => p.id !== id).slice(0, 4))
            }
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    addItem(product as any, selectedColor, selectedSize, quantity)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleToggleFavorite = async () => {
    if (!product) return
    await toggleFavorite(product as any)
  }

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          toast.success('¡Enlace del producto copiado al portapapeles!')
        })
        .catch(() => {
          toast.error('No se pudo copiar el enlace')
        })
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-obsidian flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold-action" />
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-display font-semibold uppercase tracking-wider text-white-diamond mb-4">Producto no encontrado</h1>
          <Link href="/catalogo">
            <Button className="btn-luxury rounded-none text-xs uppercase tracking-widest font-semibold px-8 py-4">Volver al Catálogo</Button>
          </Link>
        </div>
      </main>
    )
  }

  const isPromotion = product.is_promotion || product.isPromotion
  const originalPrice = product.original_price || product.originalPrice

  // Compute available stock for the selected size
  // If the product has sizes configured, we always use sizes_stock.
  // If sizes_stock is present, look up the selected size; default to 0 if not found.
  // If sizes_stock is absent (old product), fall back to global stock.
  const hasSizes = product.sizes && product.sizes.length > 0
  const hasSizesStock = product.sizes_stock && Object.keys(product.sizes_stock).length > 0

  const availableStock = hasSizes
    ? (selectedSize
        ? (hasSizesStock ? (product.sizes_stock![selectedSize] ?? 0) : product.stock)
        : (hasSizesStock ? 0 : product.stock)) // if no sizes_stock configured, allow selection without size restriction
    : product.stock;

  return (
    <div className="min-h-screen bg-obsidian text-foreground">
      <Navbar />

      {/* Tricolor accent strip */}
      <div className="fixed top-0 left-0 right-0 h-0.5 flex z-[60]">
        <div className="flex-1 bg-[#FCD116]" />
        <div className="flex-1 bg-[#003893]" />
        <div className="flex-1 bg-[#CE1126]" />
      </div>

      <main className="pt-36 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Breadcrumb */}
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
              Volver al Catálogo
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Images */}
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative aspect-square rounded-none overflow-hidden bg-carbon border border-steel/30 shadow-2xl mb-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={product.images?.[selectedImage] || '/images/placeholder-hat.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  {isPromotion && (
                    <span className="bg-destructive border border-destructive-foreground/10 text-white text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-none shadow-md">
                      Oferta
                    </span>
                  )}
                  {product.featured && (
                    <span className="bg-gold-action text-obsidian text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-none shadow-md">
                      Destacado
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedImage(index)
                        if (product.colors?.[index]) {
                          setSelectedColor(product.colors[index])
                        }
                      }}
                      className={`relative w-20 h-20 rounded-none overflow-hidden border transition-all ${
                        selectedImage === index
                          ? 'border-gold-action'
                          : 'border-steel/30 opacity-60 hover:opacity-100 bg-carbon'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} - ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Videos */}
              {product.videos && product.videos.length > 0 && (
                <div className="mt-6 space-y-4">
                  {product.videos.map((video, index) => (
                    <video
                      key={index}
                      src={video}
                      controls
                      className="w-full rounded-none border border-steel/30"
                      preload="metadata"
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:pl-6"
            >
              <span className="text-[10px] font-semibold text-gold-action tracking-[0.25em] uppercase font-sans">
                {product.category}
              </span>

              <h1 className="mt-3 text-3xl md:text-4xl font-display font-semibold text-white-diamond uppercase tracking-wide">
                {product.name}
              </h1>

              <div className="mt-4 flex items-center gap-4 border-b border-steel/10 pb-6">
                <span className="text-2xl font-bold text-gradient-gold">
                  {formatPrice(product.price)}
                </span>
                {originalPrice && (
                  <>
                    <span className="text-lg text-titanium line-through font-light">
                      {formatPrice(originalPrice)}
                    </span>
                    <span className="bg-destructive/10 border border-destructive/20 text-destructive text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-none">
                      -{Math.round((1 - product.price / originalPrice) * 100)}%
                    </span>
                  </>
                )}
              </div>

              <p className="mt-6 text-titanium text-sm leading-relaxed font-sans font-light">
                {product.description}
              </p>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-8 border-t border-steel/10 pt-6">
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-titanium mb-3">
                    Color: <span className="text-gold-action">{selectedColor}</span>
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color)
                          setSelectedImage(getImageIndexForColor(color, product))
                        }}
                        className={`px-4 py-2 rounded-none border text-xs uppercase tracking-wider font-medium transition-all ${
                          selectedColor === color
                            ? 'border-gold-action bg-gold-action/10 text-gold-action'
                            : 'border-steel/30 text-chrome hover:border-gold-action/50 hover:text-gold-action'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-6 border-t border-steel/10 pt-6">
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-titanium mb-3">
                    Talla: <span className="text-gold-action">{selectedSize || 'Selecciona una talla'}</span>
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes.map((size) => {
                      // Per-size stock: if sizes_stock exists, use it; otherwise fall back to global stock
                      const sizeStock = hasSizesStock
                        ? (product.sizes_stock![size] ?? 0)
                        : product.stock;
                      const isOutOfStock = sizeStock === 0;
                      
                      return (
                        <button
                          key={size}
                          onClick={() => {
                            if (!isOutOfStock) {
                              setSelectedSize(size);
                              setQuantity(1); // Reset quantity on size change
                            }
                          }}
                          disabled={isOutOfStock}
                          className={`px-4 py-2 rounded-none border text-xs uppercase tracking-wider font-medium transition-all ${
                            isOutOfStock
                              ? 'border-steel/10 text-titanium/40 bg-carbon/50 cursor-not-allowed line-through'
                              : selectedSize === size
                              ? 'border-gold-action bg-gold-action/10 text-gold-action'
                              : 'border-steel/30 text-chrome hover:border-gold-action/50 hover:text-gold-action'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mt-6 border-t border-steel/10 pt-6">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-titanium mb-3">Cantidad</h3>
                <div className="flex items-center gap-4">
                  <div className="inline-flex items-center gap-4 p-1 border border-steel/30 bg-graphite rounded-none">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-none bg-carbon border border-steel/20 flex items-center justify-center hover:bg-gold-action hover:text-obsidian transition-colors text-chrome"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-semibold text-white-diamond font-sans">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                      className="w-8 h-8 rounded-none bg-carbon border border-steel/20 flex items-center justify-center hover:bg-gold-action hover:text-obsidian transition-colors text-chrome"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-xs text-titanium font-sans font-light">
                    {availableStock === 0 ? (
                      <span className="text-destructive font-semibold">Agotado</span>
                    ) : (
                      `${availableStock} unidades disponibles`
                    )}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 btn-luxury py-6 text-xs uppercase tracking-[0.2em] font-semibold rounded-none"
                  disabled={addedToCart || availableStock === 0 || (product.sizes?.length > 0 && !selectedSize)}
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-obsidian" />
                      ¡Agregado!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 mr-2 text-obsidian" />
                      Agregar al Carrito
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`w-14 h-14 border-steel/30 rounded-none transition-colors hover:border-gold-action/50 ${
                    product && isFav ? 'text-gold-action border-gold-action/50 bg-gold-action/5' : 'text-chrome'
                  }`}
                  onClick={handleToggleFavorite}
                >
                  <Heart className={`w-4 h-4 ${product && isFav ? 'fill-current text-gold-action' : ''}`} />
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="icon"
                  className="w-14 h-14 border-steel/30 rounded-none hover:border-gold-action/50 text-chrome"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Trust Features */}
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-steel/10 pt-8">
                <div className="flex flex-col items-center text-center p-4 rounded-none bg-carbon border border-steel/30 shadow-lg hover:border-gold-action/30 transition-colors">
                  <Truck className="w-5 h-5 text-gold-action mb-2" />
                  <span className="text-[10px] uppercase tracking-wider text-titanium font-medium">Envío Nacional</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-none bg-carbon border border-steel/30 shadow-lg hover:border-gold-action/30 transition-colors">
                  <Shield className="w-5 h-5 text-gold-action mb-2" />
                  <span className="text-[10px] uppercase tracking-wider text-titanium font-medium">Garantía</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-none bg-carbon border border-steel/30 shadow-lg hover:border-gold-action/30 transition-colors">
                  <RotateCcw className="w-5 h-5 text-gold-action mb-2" />
                  <span className="text-[10px] uppercase tracking-wider text-titanium font-medium">Devoluciones</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mt-28 border-t border-steel/10 pt-16"
            >
              <h2 className="text-2xl font-display font-bold mb-10 text-white-diamond uppercase tracking-wider">
                PRODUCTOS <span className="text-gradient-gold">RELACIONADOS</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {relatedProducts.map((relatedProduct) => (
                  <Link key={relatedProduct.id} href={`/producto/${relatedProduct.id}`}>
                    <div className="group bg-carbon border border-steel/30 rounded-none overflow-hidden shadow-lg transition-all hover:border-gold-action/25">
                      <div className="relative aspect-square overflow-hidden bg-graphite">
                        <Image
                          src={relatedProduct.images?.[0] || '/images/placeholder-hat.jpg'}
                          alt={relatedProduct.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-sm text-white-diamond group-hover:text-gold-action transition-colors truncate">
                          {relatedProduct.name}
                        </h3>
                        <span className="text-xs font-semibold text-gold-action mt-2 inline-block">
                          {formatPrice(relatedProduct.price)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
      <ChatBot />
    </div>
  )
}
