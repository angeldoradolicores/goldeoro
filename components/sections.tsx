'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Truck, Shield, CreditCard, Headphones, Star, Award } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'Envío Nacional',
    description: 'Envíos a toda Colombia con Interrapidísimo y Enviar. Cotiza tu envío al instante.',
  },
  {
    icon: Shield,
    title: 'Garantía de Calidad',
    description: 'Todas nuestras gorras cuentan con garantía de autenticidad y calidad premium.',
  },
  {
    icon: CreditCard,
    title: 'Pago Seguro',
    description: 'Múltiples métodos de pago: Tarjetas, PSE, Nequi, Daviplata y más.',
  },
  {
    icon: Headphones,
    title: 'Soporte 24/7',
    description: 'Nuestro equipo está disponible para ayudarte en cualquier momento.',
  },
]

const testimonials = [
  {
    name: 'Carlos Rodríguez',
    role: 'Influencer',
    content: 'La calidad de las gorras es increíble. El bordado en oro es simplemente espectacular. 100% recomendado.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
  },
  {
    name: 'María González',
    role: 'Fashionista',
    content: 'Por fin encontré una tienda que entiende el streetwear de lujo. Mis nuevas gorras favoritas.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
  },
  {
    name: 'Andrés Martínez',
    role: 'DJ Profesional',
    content: 'El servicio al cliente es excepcional y los productos son de primera. Ya tengo 5 gorras de esta tienda.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
}

// Componente de sección header compartido
function SectionLabel({ eyebrow, title, highlight }: { eyebrow: string; title: string; highlight: string }) {
  return (
    <div className="text-center mb-16">
      <div className="flex items-center justify-center gap-4 mb-5">
        <div style={{ width: '28px', height: '1px', background: 'linear-gradient(to right, transparent, #C8A44D)' }} />
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.45em]"
          style={{ fontFamily: 'var(--font-sans)', color: '#C8A44D', letterSpacing: '0.45em' }}
        >
          {eyebrow}
        </span>
        <div style={{ width: '28px', height: '1px', background: 'linear-gradient(to left, transparent, #C8A44D)' }} />
      </div>
      <h2
        className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight"
        style={{ fontFamily: 'var(--font-cinzel)', color: '#F5F5F5', letterSpacing: '-0.01em' }}
      >
        {title}{' '}
        <span
          style={{
            background: 'linear-gradient(135deg, #B08D57 0%, #D4AF37 50%, #E6C989 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {highlight}
        </span>
      </h2>
    </div>
  )
}

export function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      className="py-28 relative overflow-hidden"
      style={{ background: '#0D0D0D' }}
    >
      {/* Top border line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(38,38,38,1), transparent)' }}
      />

      <div className="container mx-auto px-4 lg:px-8 relative">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0}
          variants={fadeUp}
        >
          <SectionLabel
            eyebrow="Por Qué Elegirnos"
            title="La Experiencia"
            highlight="Luxury"
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px"
          style={{ border: '1px solid #1a1a1a' }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={index + 1}
              variants={fadeUp}
              className="group"
            >
              <div
                className="h-full p-8 transition-all duration-500"
                style={{
                  background: '#0D0D0D',
                  borderRight: index < 3 ? '1px solid #1a1a1a' : 'none',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.background = '#171717'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = '#0D0D0D'
                }}
              >
                {/* Icono */}
                <div className="mb-6">
                  <div
                    className="w-12 h-12 flex items-center justify-center mb-0"
                    style={{ border: '1px solid #262626' }}
                  >
                    <feature.icon style={{ width: '20px', height: '20px', color: '#C8A44D' }} />
                  </div>
                </div>

                {/* Número decorativo */}
                <span
                  className="block text-xs mb-4 font-black"
                  style={{
                    fontFamily: 'var(--font-cinzel)',
                    color: '#1a1a1a',
                    fontSize: '3rem',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    userSelect: 'none',
                  }}
                >
                  0{index + 1}
                </span>

                <h3
                  className="text-sm font-bold mb-3 uppercase tracking-[0.1em]"
                  style={{ fontFamily: 'var(--font-cinzel)', color: '#C0C0C0', letterSpacing: '0.1em' }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{ fontFamily: 'var(--font-sans)', color: '#555', lineHeight: 1.7 }}
                >
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom border */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(38,38,38,1), transparent)' }}
      />
    </section>
  )
}

export function TestimonialsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-28 relative overflow-hidden" style={{ background: '#050505' }}>
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0}
          variants={fadeUp}
        >
          <SectionLabel
            eyebrow="Testimonios"
            title="Lo Que Dicen"
            highlight="Nuestros Clientes"
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ border: '1px solid #1a1a1a' }}>
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={index + 1}
              variants={fadeUp}
            >
              <div
                className="h-full p-8 transition-all duration-500"
                style={{
                  background: '#0D0D0D',
                  borderRight: index < 2 ? '1px solid #1a1a1a' : 'none',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#171717'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = '#0D0D0D'}
              >
                {/* Stars */}
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} style={{ width: '12px', height: '12px', fill: '#C8A44D', color: '#C8A44D' }} />
                  ))}
                </div>

                {/* Quote mark */}
                <div
                  className="text-4xl font-black leading-none mb-3 select-none"
                  style={{ fontFamily: 'Georgia', color: '#1a1a1a' }}
                >
                  "
                </div>

                <p
                  className="text-sm leading-relaxed mb-8"
                  style={{ fontFamily: 'var(--font-sans)', color: '#8B8B8B', lineHeight: 1.8 }}
                >
                  {testimonial.content}
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-5" style={{ borderTop: '1px solid #1a1a1a' }}>
                  <div
                    className="w-10 h-10 overflow-hidden"
                    style={{ border: '1px solid #262626' }}
                  >
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p
                      className="text-xs font-semibold tracking-[0.08em]"
                      style={{ fontFamily: 'var(--font-cinzel)', color: '#C0C0C0' }}
                    >
                      {testimonial.name}
                    </p>
                    <p
                      className="text-[10px] mt-0.5 uppercase tracking-[0.2em]"
                      style={{ fontFamily: 'var(--font-sans)', color: '#555', letterSpacing: '0.2em' }}
                    >
                      {testimonial.role}
                    </p>
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
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section
      ref={ref}
      className="py-14"
      style={{
        background: '#0D0D0D',
        borderTop: '1px solid #1a1a1a',
        borderBottom: '1px solid #1a1a1a',
      }}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-10 md:gap-20"
        >
          {['SUPREME', 'NEW ERA', 'NIKE', 'ADIDAS', 'JORDAN'].map((brand, index) => (
            <motion.span
              key={brand}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-lg md:text-2xl font-black uppercase tracking-[0.25em] cursor-default transition-colors duration-300"
              style={{
                fontFamily: 'var(--font-cinzel)',
                color: '#1a1a1a',
                letterSpacing: '0.25em',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLSpanElement).style.color = '#C8A44D'}
              onMouseLeave={e => (e.currentTarget as HTMLSpanElement).style.color = '#1a1a1a'}
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
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-28 relative overflow-hidden" style={{ background: '#050505' }}>
      {/* Background texture imagen con overlay fuerte */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=1920&q=80"
          alt="Promo background"
          className="w-full h-full object-cover"
          style={{ opacity: 0.06 }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, #050505 0%, rgba(5,5,5,0.85) 50%, #050505 100%)' }}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badge */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div style={{ width: '28px', height: '1px', background: 'linear-gradient(to right, transparent, #C8A44D)' }} />
              <Award style={{ width: '14px', height: '14px', color: '#C8A44D' }} />
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.45em]"
                style={{ fontFamily: 'var(--font-sans)', color: '#C8A44D', letterSpacing: '0.45em' }}
              >
                Oferta Especial
              </span>
              <Award style={{ width: '14px', height: '14px', color: '#C8A44D' }} />
              <div style={{ width: '28px', height: '1px', background: 'linear-gradient(to left, transparent, #C8A44D)' }} />
            </div>

            <h2
              className="text-4xl md:text-6xl lg:text-7xl font-black leading-none mb-4"
              style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '-0.01em' }}
            >
              <span
                style={{
                  background: 'linear-gradient(135deg, #B08D57 0%, #D4AF37 40%, #E6C989 60%, #C8A44D 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                30% OFF
              </span>
            </h2>

            <p
              className="text-xl md:text-2xl font-light mb-4"
              style={{ fontFamily: 'var(--font-cinzel)', color: '#F5F5F5', letterSpacing: '0.05em' }}
            >
              en tu Primera Compra
            </p>

            <p
              className="text-sm mb-10 leading-relaxed"
              style={{ fontFamily: 'var(--font-sans)', color: '#8B8B8B' }}
            >
              Usa el código{' '}
              <span
                className="font-bold px-3 py-1"
                style={{
                  fontFamily: 'var(--font-cinzel)',
                  color: '#D4AF37',
                  border: '1px solid rgba(200,164,77,0.3)',
                  background: 'rgba(200,164,77,0.06)',
                  letterSpacing: '0.15em',
                }}
              >
                LUXURY30
              </span>
              {' '}al finalizar tu compra y obtén 30% de descuento en toda tu orden.
            </p>

            {/* Countdown boxes */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="inline-flex items-center gap-px"
              style={{ border: '1px solid #1a1a1a' }}
            >
              {[
                { value: '24', label: 'Horas' },
                { value: '59', label: 'Min' },
                { value: '59', label: 'Seg' },
              ].map((unit, i) => (
                <div key={unit.label}>
                  <div
                    className="px-7 py-5 text-center"
                    style={{
                      background: '#0D0D0D',
                      borderRight: i < 2 ? '1px solid #1a1a1a' : 'none',
                    }}
                  >
                    <span
                      className="block text-2xl font-black mb-1"
                      style={{
                        fontFamily: 'var(--font-cinzel)',
                        background: 'linear-gradient(135deg, #B08D57, #D4AF37)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {unit.value}
                    </span>
                    <span
                      className="text-[9px] uppercase tracking-[0.3em]"
                      style={{ fontFamily: 'var(--font-sans)', color: '#555', letterSpacing: '0.3em' }}
                    >
                      {unit.label}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
