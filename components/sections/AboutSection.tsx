"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { img as imgPath } from '@/lib/constants'
const img = imgPath
import { ImageCarousel } from '@/components/image-carousel'
import { useLanguage } from '@/components/language-context'

const DEFAULT_ABOUT_IMAGES = [
  { src: "/images/about-us.webp", name: "Illia" },
  { src: "/images/about-us-2.webp", name: "Victor" },
  { src: "/images/about-us-3.webp", name: "Nataliia" },
]

export default function AboutSection() {
  const { t } = useLanguage()
  const aboutRef = useRef<HTMLElement>(null)
  const [aboutImageIndex, setAboutImageIndex] = useState(0)
  const [aboutImages, setAboutImages] = useState<{ src: string; name: string }[] | null>(null)
  const { scrollYProgress: aboutScroll } = useScroll({
    target: aboutRef,
    offset: ["start end", "end start"]
  })
  const aboutImageY = useTransform(aboutScroll, [0, 1], ["-20%", "20%"])

  useEffect(() => {
    fetch('/api/public-settings')
      .then(r => r.json())
      .then(data => {
        if (data?.about_images?.images?.length > 0) {
          setAboutImages(data.about_images.images)
        }
      })
      .catch(() => {})
  }, [])

  const images = aboutImages || DEFAULT_ABOUT_IMAGES
  const names = images.map(i => i.name)

  return (
    <section id="about" ref={aboutRef} className="py-28 lg:py-36 relative bg-background">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-12 md:gap-16 lg:gap-24 items-center">
          <div className="order-1 lg:order-1">
            <p className="text-[39px] tracking-[0.35em] mb-0">
              <span className="relative inline-block font-script text-black">
                {t.about.ourStory}
                <div 
                  className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[600%] -z-10"
                  style={{
                    backgroundImage: `url(${img("/images/about-card.webp")})`,
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                  }}
                />
              </span>
            </p>
            <div className="w-10 h-px bg-primary/60 mb-10" />
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-muted-foreground leading-[1.9] mb-6 text-xl md:text-lg lg:text-xl"
            >
              {t.about.para1}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-muted-foreground leading-[1.9] mb-10 text-xl md:text-lg lg:text-xl"
            >
              {t.about.para2}
            </motion.p>
            <motion.a
              href="#contact"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center gap-4 text-primary text-[15px] tracking-[0.25em] hover:gap-6 transition-all duration-300"
            >
              <span className="border-b border-primary/60 pb-1">{t.about.getInTouch}</span>
              <ArrowRight className="w-4 h-4 opacity-80" />
            </motion.a>
          </div>

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
                    images={images.map(i => ({ src: img(i.src), alt: i.name }))}
                    onChange={setAboutImageIndex}
                    showDots={false}
                  />
                </div>
              </motion.div>
            </div>
            {names.length > 0 && (
              <div className="flex justify-center gap-2 mt-4 z-10">
                {images.map((_, i) => (
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
                <span className="text-3xl lg:text-4xl font-script leading-none text-black">{names[aboutImageIndex]}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
