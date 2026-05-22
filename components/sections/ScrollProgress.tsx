"use client"

import { useEffect, useRef } from 'react'

const SEGMENTS = 16

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const diamondsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    let raf: number
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0

      if (barRef.current) {
        barRef.current.style.height = `${p * 100}%`
      }
      if (dotRef.current) {
        const track = dotRef.current.parentElement!
        dotRef.current.style.top = `${p * track.offsetHeight}px`
        dotRef.current.style.opacity = p > 0.01 ? '1' : '0'
      }

      diamondsRef.current.forEach((el, i) => {
        if (!el) return
        const threshold = (i + 1) / (SEGMENTS + 1)
        if (p >= threshold) {
          el.style.opacity = '1'
          el.style.transform = 'translate(-50%, -50%) scale(1)'
        } else {
          const fade = p / threshold
          el.style.opacity = String(fade * 0.2)
          el.style.transform = `translate(-50%, -50%) scale(${0.3 + 0.7 * fade})`
        }
      })
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; update() })
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="fixed left-3 sm:left-5 top-0 bottom-0 z-[55] pointer-events-none hidden lg:block">
      {/* Track line */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-foreground/[0.07]" />

      {/* Gold fill */}
      <div
        ref={barRef}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-[#d4b88e] via-[#c2a57b] to-[#8b6f47] shadow-[0_0_6px_#c2a57b40] transition-none"
        style={{ height: '0%' }}
      />

      {/* Diamond track markers */}
      {Array.from({ length: SEGMENTS }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { diamondsRef.current[i] = el }}
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-foreground/10 transition-none"
          style={{
            top: `${(i + 1) / (SEGMENTS + 1) * 100}%`,
            opacity: 0.1,
            transform: 'translate(-50%, -50%) scale(0.5)',
          }}
        >
          <svg width="8" height="8" viewBox="-4 -4 8 8" fill="currentColor">
            <path d="M0,-3 L3,0 L0,3 L-3,0 Z" />
          </svg>
        </div>
      ))}

      {/* Active glow dot */}
      <div
        ref={dotRef}
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 transition-none"
        style={{ top: '0px', opacity: '0' }}
      >
        {/* Outer glow rings */}
        <div className="relative w-7 h-7 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#c2a57b]/10 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-1 rounded-full bg-[#c2a57b]/20" />
          {/* Center diamond */}
          <svg width="10" height="10" viewBox="-5 -5 10 10" className="relative z-10">
            <defs>
              <linearGradient id="dotGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#d4b88e" />
                <stop offset="100%" stopColor="#8b6f47" />
              </linearGradient>
            </defs>
            <path d="M0,-4 L4,0 L0,4 L-4,0 Z" fill="url(#dotGrad)" />
          </svg>
        </div>
      </div>
    </div>
  )
}
