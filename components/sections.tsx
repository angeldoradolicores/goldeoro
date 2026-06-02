'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Truck, Shield, CreditCard, Headphones, Star, Award } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'Envio Nacional',
    description: 'Envios a toda Colombia con Interrapidisimo y Enviar. Cotiza tu envio al instante.',
  },
  {
    icon: Shield,
    title: 'Garantia de Calidad',
    description: 'Todas nuestras gorras cuentan con garantia de autenticidad y calidad premium.',
  },
  {
    icon: CreditCard,
    title: 'Pago Seguro',
    description: 'Multiples metodos de pago. Tarjetas, PSE, Nequi, Daviplata y mas.',
  },
  {
    icon: Headphones,
    title: 'Soporte 24/7',
    description: 'Nuestro equipo esta disponible para ayudarte en cualquier momento.',
  },
]

const testimonials = [
  {
    name: 'Carlos Rodriguez',
    role: 'Influencer',
    content: 'La calidad de las gorras es increible. El bordado en oro es simplemente espectacular. 100% recomendado.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
  },
  {
    name: 'Maria Gonzalez',
    role: 'Fashionista',
    content: 'Por fin encontre una tienda que entiende el streetwear de lujo. Mis nuevas gorras favoritas.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
  },
  {
    name: 'Andres Martinez',
    role: 'DJ Profesional',
    content: 'El servicio al cliente es excepcional y los productos son de primera. Ya tengo 5 gorras de esta tienda.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
  },
]

export function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="py-24 bg-secondary/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary tracking-wider uppercase">
            Por Que Elegirnos
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl font-display font-bold">
            La Experiencia <span className="text-gradient-gold">Luxury</span>
          </h2>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full p-6 rounded-2xl glass hover-lift cursor-default">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function TestimonialsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary tracking-wider uppercase">
            Testimonios
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl font-display font-bold">
            Lo Que Dicen <span className="text-gradient-gold">Nuestros Clientes</span>
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full p-6 rounded-2xl bg-card border border-border/50 hover-lift">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-foreground/90 leading-relaxed mb-6">
                  {`"${testimonial.content}"`}
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
                  />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function BrandsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="py-16 border-y border-border/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
        >
          {['SUPREME', 'NEW ERA', 'NIKE', 'ADIDAS', 'JORDAN'].map((brand, index) => (
            <motion.span
              key={brand}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-2xl md:text-3xl font-bold text-muted-foreground/30 hover:text-primary/50 transition-colors cursor-default"
            >
              {brand}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export function PromoBanner() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=1920&q=80"
          alt="Promo background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background" />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Award className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Oferta Especial</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-display font-bold mb-4">
              <span className="text-gradient-gold">30% OFF</span> en tu Primera Compra
            </h2>

            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Usa el codigo <span className="font-mono text-primary font-bold">LUXURY30</span> al 
              finalizar tu compra y obtén un 30% de descuento en toda tu orden.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="inline-flex items-center gap-4 p-4 rounded-2xl glass"
            >
              <div className="text-center px-4">
                <span className="block text-3xl font-bold text-gradient-gold">24</span>
                <span className="text-xs text-muted-foreground">Horas</span>
              </div>
              <span className="text-2xl text-muted-foreground">:</span>
              <div className="text-center px-4">
                <span className="block text-3xl font-bold text-gradient-gold">59</span>
                <span className="text-xs text-muted-foreground">Minutos</span>
              </div>
              <span className="text-2xl text-muted-foreground">:</span>
              <div className="text-center px-4">
                <span className="block text-3xl font-bold text-gradient-gold">59</span>
                <span className="text-xs text-muted-foreground">Segundos</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
