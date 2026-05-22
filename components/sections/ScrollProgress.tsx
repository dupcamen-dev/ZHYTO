"use client"

import { motion, useScroll, useTransform } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const width = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-1.5 pointer-events-none">
      <div className="absolute inset-0 bg-black/10" />
      <motion.div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#b08f64] via-[#c2a57b] to-[#d4b88e] shadow-[0_0_4px_#c2a57b80]"
        style={{ width }}
      />
    </div>
  )
}
