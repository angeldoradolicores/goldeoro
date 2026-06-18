"use client"

import { useEffect, useState } from 'react'

export default function Preloader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const onLoad = () => {
      // max duration 1.5s then hide
      setTimeout(() => setVisible(false), 800)
    }
    if (document.readyState === 'complete') {
      onLoad()
    } else {
      window.addEventListener('load', onLoad)
      return () => window.removeEventListener('load', onLoad)
    }
  }, [])

  if (!visible) return null

  return (
    <div className="uc-preloader fixed inset-0 z-[10000] flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="uc-logo w-28 h-28 rounded-full flex items-center justify-center bg-[linear-gradient(135deg,#111827,#080b11)] shadow-[0_8px_40px_rgba(252,209,22,0.15)] border border-[#FCD116]/20">
          <div className="uc-cross text-[40px] text-[white] text-shadow font-display animate-spin duration-1000">⚽</div>
        </div>
        <div className="text-sm text-[rgba(255,255,255,0.95)] tracking-widest font-bold font-sans">GOL DE ORO</div>
      </div>
    </div>
  )
}
