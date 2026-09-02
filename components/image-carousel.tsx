"use client"

import { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft } from 'lucide-react'

interface ImageCarouselProps {
  images: { src: string; alt: string }[]
  onChange?: (index: number) => void
}

export function ImageCarousel({ images, onChange }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [showHint, setShowHint] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef(0)
  const dragStartY = useRef(0)
  const dragOffset = useRef(0)
  const dragging = useRef(false)
  const hasSwipedRef = useRef(false)

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
    dragStartY.current = e.touches[0].clientY
    dragOffset.current = 0
  }, [])

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current) return
      const x = 'touches' in e ? e.touches[0].clientX : e.clientX
      const y = 'touches' in e ? e.touches[0].clientY : 0
      const dx = x - dragStart.current
      const dy = y - dragStartY.current
      dragOffset.current = dx
      if ('touches' in e && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
        e.preventDefault()
      }
    }

    const handleUp = () => {
      if (!dragging.current) return
      dragging.current = false
      if (!hasSwipedRef.current && Math.abs(dragOffset.current) > 50) {
        hasSwipedRef.current = true
        setShowHint(false)
      }
      if (Math.abs(dragOffset.current) > 50) {
        goTo(current + (dragOffset.current < 0 ? 1 : -1))
      }
    }

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
  }, [current, goTo])

  useEffect(() => {
    if (current > 0) { setShowHint(false); hasSwipedRef.current = true }
  }, [current])

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  if (images.length === 0) return null

  return (
    <div className="relative w-full h-full select-none">
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden touch-pan-y"
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
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
            >
              <motion.div
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronRight className="w-8 h-8 text-white drop-shadow-lg" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {images.length > 1 && (
        <>
          <button
            onClick={() => goTo(current - 1)}
            className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors cursor-pointer ${current === 0 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => goTo(current + 1)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors cursor-pointer ${current === images.length - 1 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </>
      )}

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
