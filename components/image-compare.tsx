"use client"

import { useRef, useState, useCallback } from 'react'
import Image from 'next/image'

interface ImageCompareProps {
  frontImage: string
  backImage: string
  alt?: string
}

export function ImageCompare({ frontImage, backImage, alt = "" }: ImageCompareProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(50)
  const [dragging, setDragging] = useState(false)

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setPosition((x / rect.width) * 100)
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    setDragging(true)
    updatePosition(e.clientX)
  }, [updatePosition])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setDragging(true)
    updatePosition(e.touches[0].clientX)
  }, [updatePosition])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return
    updatePosition(e.clientX)
  }, [dragging, updatePosition])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging) return
    updatePosition(e.touches[0].clientX)
  }, [dragging, updatePosition])

  const stopDragging = useCallback(() => setDragging(false), [])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none cursor-ew-resize"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={stopDragging}
    >
      {/* Back image (ingredients) — always visible */}
      <Image
        src={backImage}
        alt={alt}
        fill
        className="object-cover pointer-events-none"
        draggable={false}
      />

      {/* Front image (syrnyky) — clipped by position */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${position}%` }}
      >
        <Image
          src={frontImage}
          alt={alt}
          fill
          className="object-cover"
          draggable={false}
          style={{ objectPosition: 'left center' }}
        />
      </div>

      {/* Divider line */}
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
