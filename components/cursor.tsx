"use client"

import { useEffect, useRef } from 'react'

export default function Cursor() {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const activeEl = el;

    function move(e: MouseEvent) {
      activeEl.style.left = e.clientX + 'px'
      activeEl.style.top = e.clientY + 'px'
    }
    function addMagnetListeners() {
      const els = document.querySelectorAll('[data-uc-magnetic], button, a, .product-card')
      els.forEach((node) => {
        node.addEventListener('mouseenter', () => activeEl.classList.add('magnet'))
        node.addEventListener('mouseleave', () => activeEl.classList.remove('magnet'))
      })
    }

    window.addEventListener('mousemove', move)
    addMagnetListeners()

    return () => {
      window.removeEventListener('mousemove', move)
    }
  }, [])

  return <div ref={ref} className="uc-cursor" aria-hidden="true" />
}
