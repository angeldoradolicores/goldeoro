'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Star, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 200])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden noise graffiti-bg">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Main gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        
        {/* Neon glow orbs */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-neon-pink/20 blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-neon-cyan/20 blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
          className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full bg-neon-green/15 blur-[80px]"
        />

        {/* Floating stars */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
            className="absolute"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
          >
            <Star 
              className="text-neon-yellow" 
              size={8 + Math.random() * 12} 
              fill="currentColor"
            />
          </motion.div>
        ))}

        {/* Graffiti lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1920 1080">
          <motion.path
            d="M0 600 Q 400 400, 800 600 T 1600 600"
            stroke="url(#gradient1)"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, delay: 0.5 }}
          />
          <motion.path
            d="M100 800 Q 500 600, 900 700 T 1700 500"
            stroke="url(#gradient2)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, delay: 1 }}
          />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--neon-pink)" />
              <stop offset="50%" stopColor="var(--neon-cyan)" />
              <stop offset="100%" stopColor="var(--neon-green)" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--neon-cyan)" />
              <stop offset="100%" stopColor="var(--neon-purple)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Content */}
      <motion.div 
        style={{ y, opacity, scale }}
        className="container mx-auto px-4 relative z-10"
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass border-animate mb-8"
          >
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-neon-yellow" />
            </motion.span>
            <span className="text-sm font-bold tracking-wider text-foreground uppercase">
              Coleccion Medellin 2024
            </span>
            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          </motion.div>

          {/* Main Title with Glitch Effect */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-none tracking-tighter">
              <motion.span 
                className="block text-foreground"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                STREET
              </motion.span>
              <motion.span 
                className="block text-gradient-neon text-glow-pink glitch relative"
                data-text="CULTURE"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                CULTURE
              </motion.span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Gorras exclusivas nacidas en las calles de 
            <span className="text-neon-pink font-bold"> Medellin</span>. 
            Cada pieza es una obra de arte urbano que define tu estilo.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link href="/catalogo">
              <Button size="lg" className="btn-luxury px-10 py-7 text-lg rounded-2xl group">
                <span>Explorar Catalogo</span>
                <motion.span
                  className="ml-2 inline-block"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </Button>
            </Link>
            <Link href="/promociones">
              <Button
                variant="outline"
                size="lg"
                className="px-10 py-7 text-lg rounded-2xl border-2 border-neon-cyan/50 hover:bg-neon-cyan/10 hover:border-neon-cyan transition-all duration-300 group"
              >
                <Sparkles className="w-5 h-5 mr-2 text-neon-cyan group-hover:animate-spin" />
                <span>Ver Ofertas</span>
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 pt-10 border-t border-border/30"
          >
            {[
              { value: '1000+', label: 'Clientes Felices', color: 'text-neon-pink' },
              { value: '50+', label: 'Disenos Unicos', color: 'text-neon-cyan' },
              { value: '24h', label: 'Envio Express', color: 'text-neon-green' },
              { value: '100%', label: 'Satisfaccion', color: 'text-neon-yellow' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-4 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300"
              >
                <motion.span 
                  className={`block text-3xl md:text-4xl lg:text-5xl font-black ${stat.color}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.5 + index * 0.1, type: "spring" }}
                >
                  {stat.value}
                </motion.span>
                <span className="text-sm text-muted-foreground mt-1 block">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-muted-foreground uppercase tracking-widest">Scroll</span>
          <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1.5 h-3 bg-primary rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
