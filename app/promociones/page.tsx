"use client"


import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Truck, ShieldCheck, CheckCircle2, TrendingUp } from "lucide-react"
import SparklesUI from '@/components/sparkles'
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { useProducts } from '@/lib/hooks/use-products'
import { type Product } from "@/lib/store"

const trustPromoCards = [
  {
    id: 1,
    title: "Envío Gratis Nacional",
    description: "Por compras mayores a $300.000 COP. Despachamos de forma inmediata a todo Colombia. ¡Que tu pasión futbolera llegue a tiempo!",
    icon: Truck,
    badge: "Beneficio Automático"
  },
  {
    id: 2,
    title: "Garantía de Autenticidad",
    description: "Todos nuestros productos cuentan con garantía de autenticidad. Nuestras camisetas 1.1, álbum Panini y coleccionables 100% oficiales.",
    icon: ShieldCheck,
    badge: "100% Confiable"
  },
  {
    id: 3,
    title: "Pagos seguros",
    description: "Compra con total tranquilidad. Protegemos cada transacción con métodos de pago confiables y seguros para que tu experiencia sea rápida, fácil y sin preocupaciones.",
    icon: CheckCircle2,
    badge: "Compra Segura"
  }
]

export default function PromocionesPage() {
  const { products: rawProducts, isLoading: loading } = useProducts({ promotion: true })
  const products = rawProducts as Product[]

  return (
    <div className="min-h-screen relative text-foreground">
      {/* Fondo Fijo Vivo de la Selección Colombia */}
      <div className="fixed inset-0 z-0">
        <img
          src="/promociones.png"
          alt="Estadio"
          className="w-full h-full object-cover opacity-50 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#FCD116]/90 via-[#003893]/80 to-[#CE1126]/90" />
        {/* Overlay oscuro suave para que el texto y las tarjetas sigan siendo legibles */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <section className="pt-40 pb-20 relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <SparklesUI extra={2} />
          </div>

          <div className="container mx-auto px-4 relative z-10 max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-graphite/40 border border-gold-action/20 rounded-none mb-8 relative">
                <SparklesUI extra={1} />
                <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-gold-action font-sans">⚽ Ofertas Mundialistas</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-white-diamond mb-6 uppercase">
                PROMOCIONES<br />
                <span className="text-gradient-gold mt-2 inline-block">ESPECIALES</span>
              </h1>
              <p className="text-sm md:text-base text-titanium max-w-xl mx-auto leading-relaxed font-sans font-light tracking-wide">
                Los mejores precios en camisetas oficiales, álbumes Panini y coleccionables del Mundial 2026 y la Selección Colombia.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Trust & Policy Grid */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid md:grid-cols-3 gap-8">
              {trustPromoCards.map((promo, index) => {
                const Icon = promo.icon
                return (
                  <motion.div
                    key={promo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.8 }}
                    className="bg-carbon border border-steel/30 rounded-none p-8 hover:border-gold-action/30 transition-all duration-300 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-6 right-6">
                      <Icon className="w-10 h-10 text-gold-action/10" />
                    </div>

                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div>
                        <span className="inline-block px-3 py-1 bg-graphite border border-steel/30 text-[9px] uppercase tracking-wider text-gold-action font-sans font-semibold rounded-none mb-4">
                          {promo.badge}
                        </span>
                        <h3 className="text-xl font-display font-semibold text-white-diamond mb-3 uppercase tracking-wide">{promo.title}</h3>
                        <p className="text-titanium leading-relaxed text-xs md:text-sm font-sans font-light">{promo.description}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Products on Sale Grid */}
        <section className="py-24 relative z-10 border-t border-white/10">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-16">
              <div>
                <div className="flex items-center gap-2 text-gold-action mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider font-sans">OFERTAS INCREIBLES</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-semibold text-white-diamond uppercase tracking-wide">⚽ Productos en Oferta</h2>
              </div>
              <Link href="/catalogo">
                <Button variant="outline" className="border-steel/50 text-chrome hover:border-gold-action/50 hover:text-gold-action rounded-none text-xs uppercase tracking-wider font-medium">
                  Ver todo el catálogo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse space-y-4">
                    <div className="aspect-square bg-graphite border border-steel/20 rounded-none" />
                    <div className="space-y-2">
                      <div className="h-3 bg-steel rounded w-1/4" />
                      <div className="h-5 bg-steel rounded w-3/4" />
                      <div className="h-4 bg-steel rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-graphite/10 border border-steel/30 rounded-none">
                <p className="text-titanium text-sm font-sans font-light">No hay productos en promoción disponibles en este momento.</p>
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}
