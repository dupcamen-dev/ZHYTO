"use client"

import { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'

interface ImageCarouselProps {
  images: { src: string; alt: string }[]
  onChange?: (index: number) => void
}

export function ImageCarousel({ images, onChange }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef(0)
  const dragOffset = useRef(0)
  const dragging = useRef(false)

  const goTo = useCallback((index: number) => {
    const next = Math.max(0, Math.min(index, images.length - 1))
    setCurrent(next)
    onChange?.(next)
  }, [images.length, onChange])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true
    dragStart.current = e.clientX
    dragOffset.current = 0
  }, [])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    dragging.current = true
    dragStart.current = e.touches[0].clientX
    dragOffset.current = 0
  }, [])

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current) return
      const x = 'touches' in e ? e.touches[0].clientX : e.clientX
      dragOffset.current = x - dragStart.current
    }

    const handleUp = () => {
      if (!dragging.current) return
      dragging.current = false
      if (Math.abs(dragOffset.current) > 50) {
        goTo(current + (dragOffset.current < 0 ? 1 : -1))
      }
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    window.addEventListener('touchmove', handleMove, { passive: true })
    window.addEventListener('touchend', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleUp)
    }
  }, [current, goTo])

  if (images.length === 0) return null

  return (
    <div className="relative w-full h-full select-none">
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {images.map((img, i) => (
            <div key={i} className="relative w-full h-full shrink-0">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover pointer-events-none"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                i === current ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
