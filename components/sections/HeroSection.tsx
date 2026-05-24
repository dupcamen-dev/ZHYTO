"use client"

import { ArrowRight, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { img as imgPath } from '@/lib/constants'
const img = imgPath
import { useLanguage } from '@/components/language-context'

export default function HeroSection() {
  const { t } = useLanguage()

  return (
    <section className="relative min-h-[120dvh] flex flex-col items-center justify-center overflow-hidden bg-background hero-parallax" style={{ contentVisibility: 'auto' } as React.CSSProperties}>
      <div className="relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-10 text-center pt-20 sm:pt-24 md:pt-28 lg:pt-28">
        <h1 className="hero-delay-1 text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-serif font-light leading-[1.1] mb-10 relative tracking-[0.05em]">
          <span className="font-script text-foreground text-[0.55em] uppercase relative inline-block tracking-[0.05em]">
            zhyto
            <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-[55%] w-[130%] h-[200%] -z-10">
              <Image
                src={img("/images/about-card.webp")}
                alt=""
                fill
                className="object-fill"
                priority
              />
            </div>
          </span>
        </h1>

        <div className="hero-fade-delay-2 w-20 h-px bg-primary/60 mb-8 mx-auto" />

        <p className="hero-delay-3 text-xl sm:text-2xl md:text-3xl text-[#f5ead6] leading-[1.8] mb-12 max-w-4xl mx-auto">
          {t.hero.description}<br />{t.hero.description2}
        </p>

        <div className="hero-delay-4">
          <a
            href="#products"
            className="group inline-flex items-center gap-5 bg-[#c2a57b] text-white text-2xl sm:text-3xl lg:text-4xl tracking-[0.35em] hover:bg-[#b08f64] transition-all duration-300 px-10 py-5 sm:px-14 sm:py-6"
          >
            <span className="pb-1">{t.hero.orderNow}</span>
            <ArrowRight className="w-7 h-7 sm:w-9 sm:h-9" />
          </a>
        </div>

        <div className="hero-delay-5 mt-20">
          <div className="chevron-bounce text-white/60">
            <ChevronDown className="w-5 h-5 mx-auto" />
            <span className="text-[10px] tracking-[0.3em] block mt-1">{t.hero.scroll}</span>
          </div>
        </div>
      </div>
    </section>
  )
}