"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  Sparkles, ArrowRight, Truck, ShieldCheck, CheckCircle2, TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { mockProducts, type Product } from "@/lib/store"

const trustPromoCards = [
  {
    id: 1,
    title: "Envío Gratis Nacional",
    description: "Por compras mayores a $200.000 COP. Despachamos de forma inmediata a toda Colombia.",
    icon: Truck,
    bgGradient: "from-amber-500/10 via-yellow-600/5 to-transparent",
    badge: "Beneficio Automático"
  },
  {
    id: 2,
    title: "Garantía de Estilo & Ajuste",
    description: "¿No te convence la horma o el color? Tienes 5 días para realizar tu cambio sin costo adicional.",
    icon: ShieldCheck,
    bgGradient: "from-gold/15 via-gold/5 to-transparent",
    badge: "100% Confiable"
  },
  {
    id: 3,
    title: "Pago Contraentrega",
    description: "Compra con total tranquilidad. Paga en efectivo al recibir tu gorra a través de Interrapidísimo.",
    icon: CheckCircle2,
    bgGradient: "from-emerald-500/10 via-teal-600/5 to-transparent",
    badge: "Compra Segura"
  }
]

export default function PromocionesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const res = await fetch('/api/products?promotion=true')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            setProducts(data)
          } else {
            // Filter from mockProducts
            const filtered = mockProducts.filter(p => p.is_promotion || (p.original_price && p.original_price > p.price))
            setProducts(filtered)
          }
        } else {
          const filtered = mockProducts.filter(p => p.is_promotion || (p.original_price && p.original_price > p.price))
          setProducts(filtered)
        }
      } catch {
        const filtered = mockProducts.filter(p => p.is_promotion || (p.original_price && p.original_price > p.price))
        setProducts(filtered)
      } finally {
        setLoading(false)
      }
    }
    fetchPromos()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        {/* Dynamic decorative blobs */}
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-full text-gold mb-6">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-sm font-bold uppercase tracking-wider">Descuentos Exclusivos</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
              PROMOCIONES<br />
              <span className="text-gold">ESPECIALES</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Lleva lo mejor del streetwear y la moda urbana con la garantía y respaldo de Urban Crown.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trust & Policy Grid (No codes, user-friendly) */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {trustPromoCards.map((promo, index) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br ${promo.bgGradient} p-8 hover:border-gold/30 transition-all duration-500`}
              >
                <div className="absolute top-6 right-6">
                  <promo.icon className="w-10 h-10 text-gold/30" />
                </div>
                
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <span className="inline-block px-3 py-1 bg-gold/20 text-gold text-xs font-semibold rounded-full mb-4">
                      {promo.badge}
                    </span>
                    <h3 className="text-2xl font-bold text-foreground mb-3">{promo.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{promo.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products on Sale Grid */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center gap-2 text-gold mb-2">
                <TrendingUp className="w-5 h-5 text-gold" />
                <span className="text-sm font-bold uppercase tracking-wider">Hot Deals</span>
              </div>
              <h2 className="text-4xl font-bold text-foreground">Gorras en Oferta</h2>
            </div>
            <Link href="/catalogo">
              <Button variant="outline" className="border-gold/30 hover:bg-gold/10">
                Ver todo el catálogo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square rounded-2xl bg-secondary/50" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-secondary/50 rounded w-1/4" />
                    <div className="h-5 bg-secondary/50 rounded w-3/4" />
                    <div className="h-4 bg-secondary/50 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No hay productos en promoción disponibles en este momento.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
