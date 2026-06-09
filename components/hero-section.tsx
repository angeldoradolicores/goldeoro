'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'

// Partícula brillante mínima
function Particle({ delay, x, y }: { delay: number; x: string; y: string }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x,
        top: y,
        width: '2px',
        height: '2px',
        background: 'rgba(200, 164, 77, 0.6)',
      }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  )
}

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 140])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  // Posiciones estáticas para partículas (evita hidratación aleatoria)
  const particles = [
    { x: '12%', y: '18%', delay: 0 },
    { x: '25%', y: '72%', delay: 0.5 },
    { x: '38%', y: '30%', delay: 1.2 },
    { x: '55%', y: '15%', delay: 0.8 },
    { x: '67%', y: '60%', delay: 1.7 },
    { x: '78%', y: '35%', delay: 0.3 },
    { x: '88%', y: '78%', delay: 2.1 },
    { x: '6%', y: '50%', delay: 1.4 },
    { x: '42%', y: '85%', delay: 0.6 },
    { x: '92%', y: '22%', delay: 1.0 },
    { x: '50%', y: '55%', delay: 2.5 },
    { x: '15%', y: '92%', delay: 0.9 },
  ]

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden noise"
      style={{ backgroundColor: '#050505' }}
    >
      {/* ── Fondo: textura satinada + destellos ────────────── */}
      <div className="absolute inset-0 z-0">
        {/* Gradiente radial central muy sutil */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 50% 50%, rgba(13,13,13,1) 0%, rgba(5,5,5,1) 100%),
              radial-gradient(ellipse 40% 40% at 20% 80%, rgba(176,141,87,0.04) 0%, transparent 70%),
              radial-gradient(ellipse 40% 40% at 80% 20%, rgba(192,192,192,0.03) 0%, transparent 70%)
            `,
          }}
        />

        {/* Línea horizontal sutil de "reflejo" */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: '45%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(200,164,77,0.06) 30%, rgba(192,192,192,0.08) 50%, rgba(200,164,77,0.06) 70%, transparent 100%)',
          }}
        />

        {/* Partículas brillantes estáticas */}
        {mounted && particles.map((p, i) => (
          <Particle key={i} x={p.x} y={p.y} delay={p.delay} />
        ))}

        {/* Humo sutil en esquinas */}
        <div
          className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(200,164,77,0.04) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute -top-10 -right-10 w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(192,192,192,0.03) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
      </div>

      {/* ── Contenido ──────────────────────────────────────── */}
      <motion.div
        style={{ y, opacity }}
        className="container mx-auto px-4 lg:px-8 relative z-10"
      >
        <div className="max-w-5xl mx-auto text-center">

          {/* Eyebrow label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center gap-4 mb-10"
          >
            <div style={{ width: '32px', height: '1px', background: 'linear-gradient(to right, transparent, #C8A44D)' }} />
            <span
              className="text-[10px] font-semibold tracking-[0.5em] uppercase"
              style={{
                fontFamily: 'var(--font-sans)',
                color: '#C8A44D',
                letterSpacing: '0.5em',
              }}
            >
              Colección 2024
            </span>
            <div style={{ width: '32px', height: '1px', background: 'linear-gradient(to left, transparent, #C8A44D)' }} />
          </motion.div>

          {/* Título principal — Cinzel, fade secuencial */}
          <div className="mb-8 overflow-hidden">
            <motion.h1
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: 'var(--font-cinzel)',
                fontSize: 'clamp(3.5rem, 10vw, 9rem)',
                fontWeight: 900,
                lineHeight: 0.92,
                letterSpacing: '-0.02em',
                color: '#F5F5F5',
              }}
            >
              URBAN
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: 'var(--font-cinzel)',
                fontSize: 'clamp(3.5rem, 10vw, 9rem)',
                fontWeight: 900,
                lineHeight: 0.92,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #B08D57 0%, #D4AF37 40%, #E6C989 60%, #C8A44D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              CROWN
            </motion.h1>
          </div>

          {/* Separador */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mx-auto mb-8"
            style={{
              width: '80px',
              height: '1px',
              background: 'linear-gradient(to right, transparent, #C8A44D, transparent)',
            }}
          />

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-14"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(0.9rem, 2vw, 1.15rem)',
              fontWeight: 300,
              letterSpacing: '0.08em',
              color: '#8B8B8B',
              maxWidth: '540px',
              margin: '0 auto 3.5rem',
              lineHeight: 1.8,
            }}
          >
            Donde el lujo y la calle se encuentran.{' '}
            <span style={{ color: '#C8A44D', fontWeight: 500 }}>Diseños exclusivos</span>{' '}
            para quienes definen su propio estándar.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Link href="/catalogo">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="group flex items-center gap-3 px-10 py-4 text-xs font-bold uppercase transition-all duration-300"
                style={{
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.2em',
                  background: 'linear-gradient(135deg, #C8A44D 0%, #B08D57 100%)',
                  color: '#050505',
                  boxShadow: '0 8px 32px rgba(200, 164, 77, 0.3)',
                }}
              >
                Explorar Colección
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>

            <Link href="/promociones">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-10 py-4 text-xs font-bold uppercase transition-all duration-300"
                style={{
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.2em',
                  color: '#C0C0C0',
                  border: '1px solid #333333',
                  background: 'transparent',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#C0C0C0'
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#F5F5F5'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#333333'
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#C0C0C0'
                }}
              >
                Nuevos Lanzamientos
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-px"
            style={{ border: '1px solid #1a1a1a' }}
          >
            {[
              { value: '1,000+', label: 'Clientes' },
              { value: '50+', label: 'Diseños' },
              { value: '24h', label: 'Despacho' },
              { value: '100%', label: 'Satisfacción' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 + index * 0.1 }}
                className="flex flex-col items-center justify-center py-8 px-4"
                style={{ background: '#0D0D0D', borderRight: index < 3 ? '1px solid #1a1a1a' : 'none' }}
              >
                <span
                  className="block text-2xl md:text-3xl font-black mb-1"
                  style={{
                    fontFamily: 'var(--font-cinzel)',
                    background: 'linear-gradient(135deg, #B08D57, #D4AF37)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {stat.value}
                </span>
                <span
                  className="text-[10px] uppercase tracking-[0.25em]"
                  style={{ fontFamily: 'var(--font-sans)', color: '#8B8B8B', letterSpacing: '0.25em' }}
                >
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ── Scroll Indicator ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown
            style={{ width: '16px', height: '16px', color: '#333' }}
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
