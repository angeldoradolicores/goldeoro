"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  Crown, Timer, Percent, Gift, Sparkles, ArrowRight, 
  ShoppingBag, Zap, Star, TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useCartStore } from "@/lib/store"

const promos = [
  {
    id: 1,
    title: "Flash Sale",
    description: "50% de descuento en gorras seleccionadas",
    discount: 50,
    code: "FLASH50",
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    bgGradient: "from-red-500/20 via-orange-500/10 to-transparent",
    icon: Zap,
  },
  {
    id: 2,
    title: "Nuevos Miembros",
    description: "20% en tu primera compra al registrarte",
    discount: 20,
    code: "WELCOME20",
    endDate: null,
    bgGradient: "from-gold/20 via-yellow-500/10 to-transparent",
    icon: Gift,
  },
  {
    id: 3,
    title: "Envio Gratis",
    description: "En compras mayores a $200.000",
    discount: 0,
    code: "FREESHIP",
    endDate: null,
    bgGradient: "from-green-500/20 via-emerald-500/10 to-transparent",
    icon: Star,
  },
]

const featuredProducts = [
  { id: 1, name: "NY Yankees Premium", originalPrice: 299000, salePrice: 149500, discount: 50, image: "/placeholder.svg" },
  { id: 2, name: "LA Dodgers Gold", originalPrice: 349000, salePrice: 244300, discount: 30, image: "/placeholder.svg" },
  { id: 3, name: "Chicago Bulls Limited", originalPrice: 279000, salePrice: 195300, discount: 30, image: "/placeholder.svg" },
  { id: 4, name: "Boston Red Sox", originalPrice: 259000, salePrice: 155400, discount: 40, image: "/placeholder.svg" },
]

function CountdownTimer({ endDate }: { endDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = endDate.getTime() - now

      if (distance < 0) {
        clearInterval(timer)
        return
      }

      setTimeLeft({
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  return (
    <div className="flex items-center gap-2">
      <Timer className="w-5 h-5 text-gold" />
      <div className="flex gap-1">
        {[
          { value: timeLeft.hours, label: "h" },
          { value: timeLeft.minutes, label: "m" },
          { value: timeLeft.seconds, label: "s" },
        ].map((item, i) => (
          <div key={i} className="flex items-center">
            <span className="bg-background/50 px-2 py-1 rounded font-mono font-bold text-gold">
              {String(item.value).padStart(2, "0")}
            </span>
            <span className="text-muted-foreground text-sm ml-0.5">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PromocionesPage() {
  const { addItem } = useCartStore()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/20 rounded-full text-gold mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Ofertas Exclusivas</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
              PROMOCIONES<br />
              <span className="text-gold">ESPECIALES</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Descubre nuestras ofertas exclusivas y aprovecha los mejores precios en gorras premium
            </p>
          </motion.div>
        </div>
      </section>

      {/* Promo Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {promos.map((promo, index) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br ${promo.bgGradient} p-8`}
              >
                <div className="absolute top-4 right-4">
                  <promo.icon className="w-12 h-12 text-gold/30" />
                </div>
                
                <div className="relative z-10">
                  {promo.discount > 0 && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold text-background text-sm font-bold rounded-full mb-4">
                      <Percent className="w-4 h-4" />
                      {promo.discount}% OFF
                    </span>
                  )}
                  
                  <h3 className="text-2xl font-bold text-foreground mb-2">{promo.title}</h3>
                  <p className="text-muted-foreground mb-4">{promo.description}</p>
                  
                  {promo.endDate && <CountdownTimer endDate={promo.endDate} />}
                  
                  <div className="mt-6 flex items-center gap-4">
                    <div className="flex-1 bg-background/50 rounded-xl px-4 py-3 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Codigo</p>
                      <p className="font-mono font-bold text-gold">{promo.code}</p>
                    </div>
                    <Button 
                      onClick={() => copyCode(promo.code)}
                      className="bg-gold hover:bg-gold/90 text-background"
                    >
                      Copiar
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Sale Products */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center gap-2 text-gold mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-wider">Hot Deals</span>
              </div>
              <h2 className="text-4xl font-bold text-foreground">Productos en Oferta</h2>
            </div>
            <Link href="/catalogo">
              <Button variant="outline" className="border-gold/30 hover:bg-gold/10">
                Ver todo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-card/50 backdrop-blur border border-border rounded-3xl overflow-hidden hover:border-gold/30 transition-all duration-500"
              >
                <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                      -{product.discount}%
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Crown className="w-20 h-20 text-gold/20 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">{product.name}</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-bold text-gold">{formatPrice(product.salePrice)}</span>
                    <span className="text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                  </div>
                  <Button 
                    onClick={() => addItem({
                      id: product.id.toString(),
                      name: product.name,
                      price: product.salePrice,
                      image: product.image,
                      quantity: 1,
                    })}
                    className="w-full bg-gold hover:bg-gold/90 text-background group"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                    Agregar al carrito
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gold/20 via-gold/10 to-transparent border border-gold/20 p-12 md:p-16"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 max-w-2xl">
              <Gift className="w-12 h-12 text-gold mb-6" />
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Suscribete y obtén 15% de descuento
              </h2>
              <p className="text-muted-foreground mb-8">
                Recibe ofertas exclusivas, lanzamientos anticipados y promociones especiales directamente en tu correo.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="flex-1 px-6 py-4 bg-background/50 border border-border rounded-xl focus:outline-none focus:border-gold"
                />
                <Button className="px-8 py-4 h-auto bg-gold hover:bg-gold/90 text-background font-semibold">
                  Suscribirme
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
