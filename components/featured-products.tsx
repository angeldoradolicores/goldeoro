'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Award } from 'lucide-react'
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
    <div className="animate-pulse space-y-4">
      <div className="aspect-square bg-graphite border border-steel/20 rounded-lg" />
      <div className="space-y-2">
        <div className="h-3 bg-steel rounded w-1/4" />
        <div className="h-5 bg-steel rounded w-3/4" />
        <div className="h-4 bg-steel rounded w-1/2" />
      </div>
    </div>
  )

  return (
    <section ref={ref} className="py-32 relative overflow-hidden bg-obsidian">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 -right-32 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(200,164,77,0.03)_0%,transparent_70%)]" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(139,139,139,0.03)_0%,transparent_70%)]" />
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-graphite/40 border border-gold-action/20 mb-8"
          >
            <Award className="w-4 h-4 text-gold-action" />
            <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-gold-action font-sans">
              Edición Limitada
            </span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-display font-bold leading-none tracking-tight">
            <span className="text-gradient-gold">PIEZAS</span>
            <br />
            <span className="text-white-diamond mt-2 inline-block">DESTACADAS</span>
          </h2>
          <p className="mt-6 text-sm md:text-base text-titanium max-w-xl mx-auto leading-relaxed font-sans font-light tracking-wide">
            Descubre nuestras piezas más exclusivas, seleccionadas para quienes buscan la máxima expresión del <span className="text-gold-action font-normal">lujo urbano</span>.
          </p>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.slice(0, 8).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mt-20"
        >
          <Link href="/catalogo">
            <Button size="lg" className="btn-luxury px-12 py-6 text-xs font-semibold uppercase tracking-[0.25em] group rounded-none">
              <span>Explorar el Catálogo</span>
              <motion.span
                className="ml-2 inline-block"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight className="w-4 h-4 text-obsidian" />
              </motion.span>
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
