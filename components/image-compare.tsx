"use client"

import { useRef, useState, useCallback, useEffect } from 'react'
import Image from 'next/image'

interface ImageCompareProps {
  frontImage: string
  backImage: string
  alt?: string
}

export function ImageCompare({ frontImage, backImage, alt = "" }: ImageCompareProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(50)
  const draggingRef = useRef(false)

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setPosition((x / rect.width) * 100)
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    draggingRef.current = true
    updatePosition(e.clientX)
  }, [updatePosition])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    draggingRef.current = true
    updatePosition(e.touches[0].clientX)
  }, [updatePosition])

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!draggingRef.current) return
      e.preventDefault()
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      updatePosition(clientX)
    }
    const handleUp = () => { draggingRef.current = false }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    window.addEventListener('touchmove', handleMove, { passive: false })
    window.addEventListener('touchend', handleUp)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleUp)
    }
  }, [updatePosition])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none cursor-ew-resize touch-none"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <Image
        src={backImage}
        alt={alt}
        fill
        className="object-cover pointer-events-none"
        draggable={false}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={frontImage}
          alt={alt}
          fill
          className="object-cover"
          draggable={false}
        />
      </div>

      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#666" strokeWidth="1.5" strokeLinecap="round">
            <path d="M6 3L2 8L6 13" />
            <path d="M10 3L14 8L10 13" />
          </svg>
        </div>
      </div>
    </div>
  )
}
