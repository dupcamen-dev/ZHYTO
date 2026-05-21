"use client"

import { useState, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { img as imgPath } from '@/lib/constants'
const img = imgPath
import { ImageCarousel } from '@/components/image-carousel'
import { useLanguage } from '@/components/language-context'

export default function AboutSection() {
  const { t } = useLanguage()
  const aboutRef = useRef<HTMLElement>(null)
  const [aboutImageIndex, setAboutImageIndex] = useState(0)
  const aboutNames = ["Illia", "Victor", "Nataliia", "Anna", "Kateryna", "Iryna"]
  const { scrollYProgress: aboutScroll } = useScroll({
    target: aboutRef,
    offset: ["start end", "end start"]
  })
  const aboutImageY = useTransform(aboutScroll, [0, 1], ["-20%", "20%"])

  return (
    <section id="about" ref={aboutRef} className="py-28 lg:py-36 relative bg-background">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-1"
          >
            <p className="text-[13px] tracking-[0.35em] text-primary mb-5">{t.about.ourStory}</p>
            <h2 className="text-4xl md:text-5xl font-serif font-light mb-10">
              <span className="text-foreground">{t.about.tasteOf}</span>
              <br />
              <span className="font-script text-primary text-[1.15em]">{t.about.home}</span>
            </h2>
            <div className="w-10 h-px bg-primary/60 mb-10" />
            <p className="text-muted-foreground leading-[1.9] mb-6 text-xl">
              {t.about.para1}
            </p>
            <p className="text-muted-foreground leading-[1.9] mb-10 text-xl">
              {t.about.para2}
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-4 text-primary text-[15px] tracking-[0.25em] hover:gap-6 transition-all duration-300"
            >
              <span className="border-b border-primary/60 pb-1">{t.about.getInTouch}</span>
              <ArrowRight className="w-4 h-4 opacity-80" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="relative order-2 lg:order-2"
          >
            <div className="relative min-h-[500px] lg:min-h-[800px] overflow-hidden">
              <motion.div
                className="absolute inset-0"
                style={{ y: aboutImageY }}
              >
                <div className="relative w-full h-full">
                  <ImageCarousel
                    images={[
                      { src: img("/images/about-us.webp"), alt: "Handmade varenyky process" },
                      { src: img("/images/about-us-2.webp"), alt: "Handmade varenyky process" },
                      { src: img("/images/about-us-3.webp"), alt: "Handmade varenyky process" },
                    ]}
                    onChange={setAboutImageIndex}
                    showDots={false}
                  />
                </div>
              </motion.div>
            </div>
            {aboutNames.length > 0 && (
              <div className="flex justify-center gap-2 mt-4 z-10">
                {[0, 1, 2].map(i => (
                  <button
                    key={i}
                    onClick={() => setAboutImageIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      i === aboutImageIndex ? 'bg-primary w-5' : 'bg-primary/30 hover:bg-primary/50'
                    }`}
                  />
                ))}
              </div>
            )}
            <div className="absolute -bottom-8 -left-8 lg:-bottom-12 lg:-left-12 w-56 h-56 lg:w-72 lg:h-72 overflow-hidden">
              <Image
                src={img("/images/about-card.webp")}
                alt=""
                fill
                className="object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl lg:text-4xl font-script leading-none text-black">{aboutNames[aboutImageIndex]}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
