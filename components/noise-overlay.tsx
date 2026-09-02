"use client"

export function NoiseOverlay() {
  return (
    <div
      className="fixed inset-0 z-[1] pointer-events-none select-none"
      style={{ mixBlendMode: 'overlay', opacity: 0.06 }}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        pointerEvents="none"
      >
        <filter id="filmNoise" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="4"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0"
          />
        </filter>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          filter="url(#filmNoise)"
          fill="white"
        />
      </svg>
    </div>
  )
}
