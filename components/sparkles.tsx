"use client"

import { motion } from 'framer-motion'

const positions = [
  { left: '8%', top: '12%', delay: 0 },
  { left: '22%', top: '68%', delay: 0.6 },
  { left: '36%', top: '28%', delay: 1.1 },
  { left: '52%', top: '14%', delay: 0.4 },
  { left: '66%', top: '58%', delay: 1.6 },
  { left: '78%', top: '34%', delay: 0.3 },
  { left: '90%', top: '76%', delay: 2.0 },
  { left: '14%', top: '48%', delay: 1.3 },
  { left: '44%', top: '82%', delay: 0.7 },
  { left: '86%', top: '20%', delay: 0.9 },
]

export default function Sparkles({ className = '', extra = 0 }: { className?: string; extra?: number }) {
  // Render base positions + `extra` large sparkles (deterministic mapping)
  const extras: { left: string; top: string; delay: number }[] = []
  for (let i = 0; i < extra; i++) {
    const base = positions[i % positions.length]
    // Slight deterministic offset so shapes don't overlap exactly
    const offsetX = ((i * 7) % 9) - 4
    const offsetY = ((i * 11) % 7) - 3
    const left = base.left.replace('%', '')
    const top = base.top.replace('%', '')
    const newLeft = `${Math.min(96, Math.max(2, Number(left) + offsetX))}%`
    const newTop = `${Math.min(96, Math.max(2, Number(top) + offsetY))}%`
    extras.push({ left: newLeft, top: newTop, delay: base.delay + (i % 3) * 0.25 })
  }

  return (
    <div className={`sparkles-container ${className}`} aria-hidden>
      {positions.map((p, i) => (
        <motion.span
          key={`s-${i}`}
          className="sparkle"
          style={{ left: p.left, top: p.top }}
          animate={{ opacity: [0, 1, 0], scale: [0.2, 1.2, 0.2] }}
          transition={{ duration: 2.6, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}

      {extras.map((p, i) => (
        <motion.span
          key={`e-${i}`}
          className="sparkle sparkle-lg"
          style={{ left: p.left, top: p.top }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1.6, 0.3] }}
          transition={{ duration: 3.6, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}

      {/* Rain effect - subtle falling lines for luxe ambience */}
      {[...Array(14)].map((_, i) => (
        <motion.span
          key={`r-${i}`}
          className="sparkle-rain"
          style={{ left: `${(i * 7) % 98}%`, top: `-10%` }}
          animate={{ y: ['-10%', '120%'], opacity: [0, 0.6, 0] }}
          transition={{ duration: 2.8 + (i % 3) * 0.4, repeat: Infinity, delay: (i % 5) * 0.2, ease: 'linear' }}
        />
      ))}

      {/* Occasional lightning flash */}
      <motion.div
        className="sparkle-lightning"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.9, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 8, delay: 3 }}
      />
    </div>
  )
}
