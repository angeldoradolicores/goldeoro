'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Truck, Shield, CreditCard, Headphones, Star, Award } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'Envío Nacional',
    description: 'Envíos a toda Colombia con Interrapidísimo. Cotiza tu envío al instante.',
  },
  {
    icon: Shield,
    title: 'Garantía de Calidad',
    description: 'Todos nuestros productos cuentan con garantía de autenticidad y calidad premium.',
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
    role: 'Hincha de la Tricolor',
    content: 'La camiseta de Colombia que compré es increíble. Calidad impecable y llegó en tiempo récord. ¡Para el Mundial 2026 voy listo!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
  },
  {
    name: 'María González',
    role: 'Coleccionista Panini',
    content: 'Por fin encontré una tienda que tiene todos los álbumes y sobres de Panini. Los precios son más que justos. Totalmente recomendada.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
  },
  {
    name: 'Andrés Martínez',
    role: 'Fán del Fútbol',
    content: 'El servicio al cliente es excepcional. Compré varios coleccionables del Mundial 2026 y todo llegó perfectamente empacado.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1 },
  }),
}

// Componente de sección header compartido
function SectionLabel({ eyebrow, title, highlight }: { eyebrow: string; title: string; highlight: string }) {
  return (
    <div className="text-center mb-16">
      <div className="flex items-center justify-center gap-4 mb-5">
        <div style={{ width: '28px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(252,209,22,0.4))' }} />
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.45em]"
          style={{ fontFamily: 'var(--font-sans)', color: '#FCD116', letterSpacing: '0.45em' }}
        >
          {eyebrow}
        </span>
        <div style={{ width: '28px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(252,209,22,0.4))' }} />
      </div>
      <h2
        className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight"
        style={{ fontFamily: 'var(--font-cinzel)', color: '#F5F5F5', letterSpacing: '-0.01em' }}
      >
        {title}{' '}
        <span
          style={{
            background: 'linear-gradient(135deg, #FCD116 0%, #FFFFFF 100%)',
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
            highlight="Gol de Oro"
          />
        </motion.div>

        <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-4 gap-px hide-scrollbar"
          style={{ border: '1px solid #1a1a1a' }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={index + 1}
              variants={fadeUp}
              className="group shrink-0 snap-center w-[85vw] md:w-auto"
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
                    <feature.icon style={{ width: '20px', height: '20px', color: '#DDE8F5' }} />
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

        <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 gap-px hide-scrollbar" style={{ border: '1px solid #1a1a1a' }}>
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={index + 1}
              variants={fadeUp}
              className="shrink-0 snap-center w-[85vw] md:w-auto"
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
                    <Star key={i} style={{ width: '12px', height: '12px', fill: '#DDE8F5', color: '#DDE8F5' }} />
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

export function CuratedSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  const curatedItems = [
    {
      title: 'Calidad de Cancha',
      description: 'Tejidos técnicos transpirables y versiones jugador O hincha de la más alta calidad.',
    },
    {
      title: 'Estampados Oficiales',
      description: 'Personaliza tus camisetas con los nombres y números de las estrellas mundiales.',
    },
    {
      title: 'Álbum y Láminas',
      description: 'Cajas de sobres, álbum tapa dura y tapa blanda',
    },
    {
      title: 'Despacho Exprés',
      description: 'Envíos rápidos a toda Colombia para que tu pasión no tenga que esperar.',
    },
  ]

  return (
    <section
      ref={ref}
      className="py-28 relative overflow-hidden"
      style={{ background: '#090909' }}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[10px] uppercase tracking-[0.45em] text-gold-action mb-4 font-semibold">Edición Limitada</p>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6"
            >
              Cada producto es una pieza
              <span
                style={{
                  background: 'linear-gradient(135deg, var(--gold-action) 0%, #003893 55%, #CE1126 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {' '}Gol de Oro
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-base md:text-lg text-slate-300 leading-relaxed max-w-xl mb-8"
            >
              Colecciones exclusivas para los hinchas que viven la fiesta más grande del fútbol. En nuestra tienda oficial, cada camiseta y álbum es un símbolo de orgullo colombiano, pasión y amor por el coleccionismo.
            </motion.p>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="p-5 border border-steel/20 rounded-3xl bg-[#111111]"
              >
                <p className="text-sm uppercase tracking-[0.24em] text-gold-action mb-3">Coleccionistas</p>
                <p className="text-sm text-slate-400 leading-relaxed">Álbum oficial Panini y caja de sobres  para completar.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="p-5 border border-steel/20 rounded-3xl bg-[#111111]"
              >
                <p className="text-sm uppercase tracking-[0.24em] text-gold-action mb-3">Orgullo Tricolor</p>
                <p className="text-sm text-slate-400 leading-relaxed">La camiseta oficial de la Selección Colombia y los artículos más esperados.</p>
              </motion.div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {curatedItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.12 }}
                className="p-6 rounded-[2rem] bg-[#101010] border border-steel/20 shadow-[0_20px_80px_rgba(0,0,0,0.2)]"
              >
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500 mb-3">{item.title}</p>
                <p className="text-sm leading-relaxed text-slate-300">{item.description}</p>
              </motion.div>
            ))}
          </div>
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
          {['FIFA', 'PANINI', 'ADIDAS', 'NIKE'].map((brand, index) => (
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
              onMouseEnter={e => (e.currentTarget as HTMLSpanElement).style.color = '#FCD116'}
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
          src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1920&q=80"
          alt="Promo background"
          className="w-full h-full object-cover"
          style={{ opacity: 0.08 }}
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
              <div style={{ width: '28px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(252,209,22,0.4))' }} />
              <Award style={{ width: '14px', height: '14px', color: '#FCD116' }} />
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.45em]"
                style={{ fontFamily: 'var(--font-sans)', color: '#FCD116', letterSpacing: '0.45em' }}
              >
                Oferta Especial
              </span>
              <Award style={{ width: '14px', height: '14px', color: '#FCD116' }} />
              <div style={{ width: '28px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(252,209,22,0.4))' }} />
            </div>

            <h2
              className="text-4xl md:text-6xl lg:text-7xl font-black leading-none mb-4"
              style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '-0.01em' }}
            >
              <span
                style={{
                  background: 'linear-gradient(135deg, #FCD116 0%, #FFFFFF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                10% OFF
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
                  color: '#FCD116',
                  border: '1px solid rgba(252,209,22,0.25)',
                  background: 'rgba(252,209,22,0.08)',
                  letterSpacing: '0.15em',
                }}
              >
                GOL2026
              </span>
              {' '}al finalizar tu compra y obtén 10% de descuento en tu primer pedido.
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
                        background: 'linear-gradient(135deg, #C9CDD2, #DDE8F5)',
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
