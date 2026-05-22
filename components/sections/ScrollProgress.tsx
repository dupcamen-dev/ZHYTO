"use client"

import { useEffect, useRef } from 'react'

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf: number
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0
      if (barRef.current) {
        barRef.current.style.height = `${p * 100}%`
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; update() })
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="fixed bottom-8 left-5 z-10 pointer-events-none hidden lg:block">
      <div className="relative w-[2px] h-16 bg-foreground/10 rounded-full">
        <div
          ref={barRef}
          className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#c2a57b] to-[#c2a57b]/40 rounded-full transition-none shadow-[0_0_4px_#c2a57b60]"
          style={{ height: '0%' }}
        />
      </div>
    </div>
  )
}
