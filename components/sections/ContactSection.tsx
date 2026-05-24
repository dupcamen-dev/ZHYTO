"use client"

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { img as imgPath } from '@/lib/constants'
const img = imgPath
import { useLanguage } from '@/components/language-context'

export default function ContactSection() {
  const { t } = useLanguage()

  return (
    <section id="contact" className="py-28 lg:py-36 relative section-orange overflow-hidden">
      <div className="max-w-7xl mx-auto sm:px-5 lg:px-10">
        <div className="max-w-5xl mx-auto py-8 px-0 sm:p-16 md:p-20 lg:p-24 text-center relative overflow-hidden max-sm:max-w-full">
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[16px] tracking-[0.35em] text-primary mb-6">{t.contact.getInTouch}</p>
            <h2 className="text-5xl sm:text-6xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-light mb-6 sm:mb-10">
              <span className="text-primary">{t.contact.readyTo}</span>{" "}
              <span
                className="font-script text-[1.15em] inline-block bg-no-repeat px-8 md:px-8 lg:px-16 py-8 order-bg"
                style={{
                  backgroundImage: `url(${img("/images/about-card.webp")})`,
                  backgroundSize: '115%',
                  color: '#1a1613',
                }}
              >{t.contact.order}</span>
            </h2>
            <p className="text-muted-foreground leading-[1.9] mb-8 sm:mb-14 text-base sm:text-lg">
              {t.contact.contactDesc}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-14">
              <a href="#products">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-12 py-7 tracking-[0.2em] text-[15px] rounded-none shadow-xl"
                >
                  {t.contact.orderNow}
                </Button>
              </a>
              <a
                href="mailto:hello@zhyto.london"
                className="text-[16px] tracking-[0.2em] text-foreground/60 hover:text-primary transition-colors border-b border-foreground/20 hover:border-primary pb-1"
              >
                HELLO@ZHYTO.LONDON
              </a>
            </div>
          </motion.div>
        </div>
        <div className="flex items-center justify-center gap-10 mt-12">
          <a href="https://www.instagram.com/zhyto.london/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors text-[14px] tracking-[0.2em]">
            {t.contact.instagram}
          </a>
          <span className="text-muted-foreground/30">|</span>
          <a href="https://wa.me/440000000000" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors text-[14px] tracking-[0.2em]">
            {t.contact.whatsapp}
          </a>
        </div>
      </div>
    </section>
  )
}
