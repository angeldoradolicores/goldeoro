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
          className="absolute rounded-full"
          style={{ 
            left: p.left, top: p.top, 
            width: '3px', height: '3px',
            background: i % 3 === 0 ? '#FCD116' : i % 3 === 1 ? '#003893' : '#CE1126',
            boxShadow: `0 0 10px ${i % 3 === 0 ? '#FCD116' : i % 3 === 1 ? '#003893' : '#CE1126'}`
          }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}

      {extras.map((p, i) => (
        <motion.span
          key={`e-${i}`}
          className="absolute rounded-full"
          style={{ 
            left: p.left, top: p.top,
            width: '5px', height: '5px',
            background: '#FCD116',
            boxShadow: '0 0 15px #FCD116'
          }}
          animate={{ opacity: [0, 1, 0], scale: [0.8, 1.8, 0.8], y: [-10, -30, -10] }}
          transition={{ duration: 4.5, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}

      {/* Rain effect - subtle tricolor falling lines */}
      {[...Array(14)].map((_, i) => (
        <motion.span
          key={`r-${i}`}
          className="absolute w-px h-6 rounded-full"
          style={{ 
            left: `${(i * 7) % 98}%`, 
            top: `-10%`,
            background: `linear-gradient(180deg, ${i % 3 === 0 ? '#FCD116' : i % 3 === 1 ? '#003893' : '#CE1126'}, transparent)`,
            opacity: 0.6
          }}
          animate={{ y: ['-10vh', '120vh'], opacity: [0, 0.6, 0] }}
          transition={{ duration: 3.5 + (i % 3) * 0.5, repeat: Infinity, delay: (i % 5) * 0.4, ease: 'linear' }}
        />
      ))}
    </div>
  )
}
