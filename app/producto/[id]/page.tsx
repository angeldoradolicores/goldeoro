'use client'

import { useState, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag, Heart, Share2, Truck, Shield, RotateCcw, Minus, Plus, Check } from 'lucide-react'
import { mockProducts, useCartStore } from '@/lib/store'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { ChatBot } from '@/components/chatbot'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price)
}

export default function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const product = mockProducts.find((p) => p.id === resolvedParams.id)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || '')
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || '')
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const { addItem } = useCartStore()

  if (!product) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
          <Link href="/catalogo">
            <Button className="btn-luxury">Volver al Catalogo</Button>
          </Link>
        </div>
      </main>
    )
  }

  const handleAddToCart = () => {
    addItem({
      product,
      quantity,
      selectedColor,
      selectedSize,
    })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const relatedProducts = mockProducts.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4)

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
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
              Volver al Catalogo
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-card mb-4">
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
                      src={product.images[selectedImage]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isPromotion && (
                    <Badge className="bg-destructive text-destructive-foreground">
                      Oferta
                    </Badge>
                  )}
                  {product.featured && (
                    <Badge className="bg-primary text-primary-foreground">
                      Destacado
                    </Badge>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-primary'
                        : 'border-transparent opacity-60 hover:opacity-100'
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
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="text-sm font-medium text-primary tracking-wider uppercase">
                {product.category}
              </span>

              <h1 className="mt-2 text-4xl md:text-5xl font-display font-bold">
                {product.name}
              </h1>

              <div className="mt-4 flex items-center gap-4">
                <span className="text-3xl font-bold text-gradient-gold">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <Badge variant="destructive">
                      -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </Badge>
                  </>
                )}
              </div>

              <p className="mt-6 text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              {/* Color Selection */}
              <div className="mt-8">
                <h3 className="text-sm font-medium mb-3">
                  Color: <span className="text-primary">{selectedColor}</span>
                </h3>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        selectedColor === color
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3">
                  Talla: <span className="text-primary">{selectedSize}</span>
                </h3>
                <div className="flex gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-lg border font-medium transition-all ${
                        selectedSize === size
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3">Cantidad</h3>
                <div className="inline-flex items-center gap-4 p-2 rounded-lg bg-secondary">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="ml-4 text-sm text-muted-foreground">
                  {product.stock} disponibles
                </span>
              </div>

              {/* Actions */}
              <div className="mt-8 flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 btn-luxury py-6 text-lg"
                  disabled={addedToCart}
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Agregado!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      Agregar al Carrito
                    </>
                  )}
                </Button>
                <Button variant="outline" size="icon" className="w-14 h-14 border-border/50">
                  <Heart className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon" className="w-14 h-14 border-border/50">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              {/* Features */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center text-center p-4 rounded-xl bg-secondary/50">
                  <Truck className="w-6 h-6 text-primary mb-2" />
                  <span className="text-xs text-muted-foreground">Envio Nacional</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-xl bg-secondary/50">
                  <Shield className="w-6 h-6 text-primary mb-2" />
                  <span className="text-xs text-muted-foreground">Garantia</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-xl bg-secondary/50">
                  <RotateCcw className="w-6 h-6 text-primary mb-2" />
                  <span className="text-xs text-muted-foreground">30 Dias Cambio</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-24"
            >
              <h2 className="text-2xl font-display font-bold mb-8">
                Productos <span className="text-gradient-gold">Relacionados</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Link key={relatedProduct.id} href={`/producto/${relatedProduct.id}`}>
                    <div className="group rounded-2xl bg-card border border-border/50 overflow-hidden hover-lift">
                      <div className="relative aspect-square">
                        <Image
                          src={relatedProduct.images[0]}
                          alt={relatedProduct.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {relatedProduct.name}
                        </h3>
                        <span className="text-lg font-bold text-gradient-gold">
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
      </section>

      <Footer />
      <CartDrawer />
      <ChatBot />
    </main>
  )
}
