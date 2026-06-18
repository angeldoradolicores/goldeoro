'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronDown, Crown } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import SparklesUI from './sparkles'

// Partícula brillante mínima tricolor
function Particle({ delay, x, y }: { delay: number; x: string; y: string }) {
  const colors = ['#FCD116', '#003893', '#CE1126'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x, top: y,
        width: '3px', height: '3px',
        background: color,
        boxShadow: `0 0 12px ${color}`
      }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
      }}
      transition={{
        duration: 4 + Math.random() * 3,
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

  const [extraSparkles, setExtraSparkles] = useState(0)
  // connect scroll to extra sparkles
  useSpawnFromScroll(scrollYProgress, setExtraSparkles)

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
      style={{ backgroundColor: '#080b11' }}
    >
      {/* ── Fondo: bandera tricolor + Estadio ────────────── */}
      <div className="absolute inset-0 z-0">
        {/* Imagen de Hinchada/Banderas de Fondo */}
        <img
          src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1920&q=80"
          alt="Estadio y Banderas"
          className="w-full h-full object-cover opacity-20 mix-blend-screen"
        />

        {/* Gradientes más fuertes con los colores de la bandera de Colombia */}
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background: `
              radial-gradient(circle at 50% 0%, rgba(252,209,22,0.15) 0%, transparent 50%),
              radial-gradient(circle at 0% 50%, rgba(0,56,147,0.15) 0%, transparent 50%),
              radial-gradient(circle at 100% 100%, rgba(206,17,38,0.15) 0%, transparent 50%),
              linear-gradient(to bottom, #080b11 0%, rgba(8,11,17,0.85) 50%, #080b11 100%)
            `,
          }}
        />

        {/* Línea horizontal brillante tricolor */}
        <div
          className="absolute left-0 right-0 z-10"
          style={{
            top: '30%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, #FCD116 30%, #003893 50%, #CE1126 70%, transparent 100%)',
            opacity: 0.4,
            filter: 'blur(1px)'
          }}
        />

        {/* Partículas de balones y confeti */}
        {mounted && particles.map((p, i) => (
          <Particle key={i} x={p.x} y={p.y} delay={p.delay} />
        ))}

        {/* Capa de micro-brillos (reusable). `extraSparkles` aumenta según scrollYProgress */}
        {mounted && <SparklesUI extra={extraSparkles} />}

        {/* Humo dorado brillante para darle toque "exclusivo doradito" */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(255,215,0,0.08) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
      </div>

      {/* ── Contenido ──────────────────────────────────────── */}
      <motion.div
        style={{ y, opacity, perspective: 1500, transformStyle: 'preserve-3d' }}
        whileHover={{ rotateX: 3, rotateY: -6, scale: 1.01 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="container mx-auto px-4 lg:px-8 relative z-10"
      >
        <div className="max-w-5xl mx-auto text-center">

          {/* Eyebrow label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <div style={{ width: '32px', height: '1px', background: 'linear-gradient(to right, transparent, #FCD116)' }} />
            <span
              className="text-[10px] font-bold tracking-[0.5em] uppercase"
              style={{
                fontFamily: 'var(--font-sans)',
                color: '#FCD116',
                letterSpacing: '0.5em',
              }}
            >
              Mundial 2026
            </span>
            <div style={{ width: '32px', height: '1px', background: 'linear-gradient(to left, transparent, #FCD116)' }} />
          </motion.div>

          {/* Título principal — Cinzel, fade secuencial */}
          <div className="mb-8 overflow-hidden">
            <motion.h1
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: 'var(--font-cinzel)',
                fontSize: 'clamp(2.5rem, 7vw, 6.5rem)',
                fontWeight: 900,
                lineHeight: 0.95,
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
              }}
            >
              VIVE LA PASIÓN
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: 'var(--font-cinzel)',
                fontSize: 'clamp(2.5rem, 7vw, 6.5rem)',
                fontWeight: 900,
                lineHeight: 0.95,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #FCD116 0%, #003893 50%, #CE1126 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              DEL MUNDIAL 2026
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
              background: 'linear-gradient(to right, transparent, rgba(252,209,22,0.3), transparent)',
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
              fontSize: 'clamp(0.95rem, 2vw, 1.25rem)',
              fontWeight: 400,
              letterSpacing: '0.04em',
              color: '#E5E7EB',
              maxWidth: '680px',
              margin: '0 auto 3.5rem',
              lineHeight: 1.8,
            }}
          >
            Las mejores camisetas, álbum <span style={{ color: '#FCD116', fontWeight: 700 }}>Panini</span> y artículos de las selecciones más importantes del mundo.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20"
          >
            <Link href="/catalogo?category=camisetas">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="group flex items-center gap-3 px-10 py-4 text-xs font-black uppercase transition-all duration-300 rounded-none cursor-pointer"
                style={{
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.2em',
                  background: '#FCD116',
                  color: '#111827',
                  boxShadow: '0 8px 32px rgba(252,209,22,0.15)',
                }}
              >
                Comprar Camisetas
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>

            <Link href="/catalogo?category=albumes">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-10 py-4 text-xs font-black uppercase transition-all duration-300 rounded-none cursor-pointer"
                style={{
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.2em',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(4px)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#FCD116'
                    ; (e.currentTarget as HTMLButtonElement).style.color = '#FCD116'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)'
                    ; (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'
                }}
              >
                Ver Colección Panini
              </motion.button>
            </Link>
          </motion.div>

          {/* Placa metálica 3D decorativa */}
          {/* <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.05 }}
            whileHover={{ rotateX: 4, rotateY: -6, scale: 1.02 }}
            className="mx-auto my-8 w-72 h-72 metallic-3d"
          >
            <div className="metallic-plate-center">
              <Crown style={{ width: 56, height: 56, color: 'rgba(13,13,13,0.85)' }} />
            </div>
          </motion.div> */}

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 3, delay: 1.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-px"
            style={{ border: '1px solid #1a1a1a' }}
          >
            {/* {[
              { value: '50+', label: 'Diseños' },
              { value: '24h', label: 'Despacho' },
              { value: '100%', label: 'Satisfacción' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.9 + index * 0.1 }}
                className="flex flex-col items-center justify-center py-8 px-4"
                style={{ background: '#0D0D0D', borderRight: index < 3 ? '1px solid #1a1a1a' : 'none' }}
              >
                <span
                  className="block text-2xl md:text-3xl font-black mb-1"
                  style={{
                    fontFamily: 'var(--font-cinzel)',
                    background: 'linear-gradient(135deg, #C9CDD2, #DDE8F5)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {stat.value}
                </span>
                <span
                  className="text-[10px] uppercase tracking-[0.25em]"
                  style={{ fontFamily: 'var(--font-sans)', color: '#BFCEDF', letterSpacing: '0.25em' }}
                >
                  {stat.label}
                </span>
              </motion.div>
            ))} */}
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

// increase extraSparkles based on scroll progress (client-side only)
function useSpawnFromScroll(scrollYProgress: any, setExtra: (n: number) => void) {
  useEffect(() => {
    if (!scrollYProgress) return
    const unsub = scrollYProgress.onChange((v: number) => {
      // spawn up to 8 extra sparkles as user scrolls through hero
      const count = Math.min(8, Math.floor((v || 0) * 10))
      setExtra(count)
    })
    return () => unsub()
  }, [scrollYProgress, setExtra])
}
