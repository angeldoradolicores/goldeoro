'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles, Zap } from 'lucide-react'
import { mockProducts, type Product } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product-card'

export function FeaturedProducts() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?featured=true&limit=8')
        if (res.ok) {
          const data = await res.json()
          // Use API data if available, otherwise fall back to mock products
          if (Array.isArray(data) && data.length > 0) {
            setProducts(data)
          } else {
            setProducts(mockProducts.filter(p => p.featured))
          }
        } else {
          setProducts(mockProducts.filter(p => p.featured))
        }
      } catch {
        setProducts(mockProducts.filter(p => p.featured))
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Skeleton loader for products
  const ProductSkeleton = () => (
    <div className="animate-pulse">
      <div className="aspect-square rounded-2xl bg-secondary/50" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-secondary/50 rounded w-1/4" />
        <div className="h-5 bg-secondary/50 rounded w-3/4" />
        <div className="h-4 bg-secondary/50 rounded w-1/2" />
      </div>
    </div>
  )

  return (
    <section ref={ref} className="py-24 relative overflow-hidden graffiti-bg">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/4 -right-32 w-[600px] h-[600px] rounded-full bg-neon-cyan/10 blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-neon-pink/10 blur-[100px]"
        />
      </div>

      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-neon-cyan/30 mb-6"
          >
            <Zap className="w-4 h-4 text-neon-cyan" />
            <span className="text-sm font-bold uppercase tracking-wider text-neon-cyan">
              Lo Mas Fire
            </span>
            <Sparkles className="w-4 h-4 text-neon-yellow" />
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
            <span className="text-foreground">Productos</span>
            <br />
            <span className="text-gradient-neon text-glow-cyan">DESTACADOS</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Descubre nuestras piezas mas exclusivas, seleccionadas para quienes buscan 
            la maxima expresion del <span className="text-neon-pink font-semibold">estilo urbano</span>.
          </p>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          <Link href="/catalogo">
            <Button size="lg" className="btn-neon-cyan px-10 py-7 text-lg rounded-2xl group">
              <span>Ver Todo el Catalogo</span>
              <motion.span
                className="ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
