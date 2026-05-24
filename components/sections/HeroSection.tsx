"use client"

import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { img as imgPath } from '@/lib/constants'
const img = imgPath
import { useLanguage } from '@/components/language-context'

export default function HeroSection() {
  const { t } = useLanguage()
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  return (
    <motion.section
      style={{ opacity: heroOpacity, scale: heroScale }}
      className="relative min-h-[120dvh] flex flex-col items-center justify-center overflow-hidden bg-background"
    >
      <div className="relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-10 text-center pt-20 sm:pt-24 md:pt-36 lg:pt-36">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-serif font-light leading-[1.1] mb-10 relative tracking-[0.05em]"
        >
          <span className="text-white block tracking-[0.2em] font-konstrukt">{t.hero.dumplings}</span>
            <span className="font-script text-foreground text-[0.55em] uppercase relative inline-block tracking-[0.05em]">
            {t.hero.withSoul}
            <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-[50%] w-[200%] h-[320%] -z-10">
              <Image
                src={img("/images/about-card.webp")}
                alt=""
                fill
                className="object-fill"
                priority
              />
            </div>
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-20 h-px bg-primary/60 mb-8 mx-auto"
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-xl sm:text-2xl md:text-3xl text-[#f5ead6] leading-[1.8] mb-12 max-w-4xl mx-auto"
        >
          {t.hero.description}<br />{t.hero.description2}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <a
            href="#products"
            className="group inline-flex items-center gap-5 bg-[#c2a57b] text-white text-2xl sm:text-3xl lg:text-4xl tracking-[0.35em] hover:bg-[#b08f64] transition-all duration-300 px-10 py-5 sm:px-14 sm:py-6"
          >
            <span className="pb-1">{t.hero.orderNow}</span>
            <ArrowRight className="w-7 h-7 sm:w-9 sm:h-9" />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-20"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-white/60"
          >
            <ChevronDown className="w-5 h-5 mx-auto" />
            <span className="text-[10px] tracking-[0.3em] block mt-1">{t.hero.scroll}</span>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}
