"use client"

import { useEffect, useRef } from 'react'

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf: number
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? (window.scrollY / max) * 100 : 0
      if (barRef.current) barRef.current.style.width = `${p}%`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; update() })
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-1.5 pointer-events-none">
      <div className="absolute inset-0 bg-black/10" />
      <div
        ref={barRef}
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#b08f64] via-[#c2a57b] to-[#d4b88e] shadow-[0_0_6px_#c2a57b]"
        style={{ width: '0%' }}
      />
    </div>
  )
}
