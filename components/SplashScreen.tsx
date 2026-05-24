"use client"

import { useEffect, useState } from 'react'
import { useLanguage } from '@/components/language-context'

export default function SplashScreen({ onReady }: { onReady: () => void }) {
  const [state, setState] = useState<'enter' | 'visible' | 'exit'>('enter')
  const { t } = useLanguage()

  useEffect(() => {
    let cancelled = false
    const frames = 8
    let count = 0

    const tick = () => {
      if (cancelled) return
      count++
      if (count >= frames) {
        setState('exit')
        document.fonts.ready.then(() => {
          setTimeout(() => {
            if (!cancelled) onReady()
          }, 600)
        })
      } else {
        requestAnimationFrame(tick)
      }
    }

    requestAnimationFrame(tick)
    return () => { cancelled = true }
  }, [onReady])

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-background flex items-center justify-center transition-opacity duration-600 ${
        state === 'exit' ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ pointerEvents: state === 'exit' ? 'none' : 'auto' }}
    >
      <div className="text-center">
        <h1 className="font-serif text-6xl md:text-8xl text-primary tracking-[0.15em] mb-4">ZHYTO</h1>
        <p className="font-serif text-sm tracking-[0.25em] text-muted-foreground uppercase">
          {t.general.loading}
        </p>
      </div>
    </div>
  )
}