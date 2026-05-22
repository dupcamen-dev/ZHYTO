"use client"

import { motion, useScroll, useTransform } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-1 pointer-events-none">
      {/* Track background */}
      <div className="absolute inset-0 bg-foreground/[0.03]" />
      {/* Fill */}
      <motion.div
        style={{ scaleX, originX: 0 }}
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#c2a57b] via-[#b08f64] to-[#8b6f47]"
      />
      {/* Glow at leading edge */}
      <motion.div
        style={{ scaleX, originX: 0 }}
        className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-transparent via-[#c2a57b]/40 to-transparent blur-sm"
      />
    </div>
  )
}
