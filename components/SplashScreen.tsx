"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { img } from '@/lib/constants'

export default function SplashScreen({ onReady }: { onReady: () => void }) {
  const [state, setState] = useState<'enter' | 'visible' | 'exit'>('enter')

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
      <div className="relative w-72 h-72 md:w-96 md:h-96">
        <Image
          src={img("/images/dsfsjfos.png")}
          alt="zhyto"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  )
}