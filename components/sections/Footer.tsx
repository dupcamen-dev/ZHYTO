"use client"

import Link from 'next/link'
import { useLanguage } from '@/components/language-context'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="py-28 bg-black">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="text-2xl md:text-4xl font-serif tracking-[0.15em] text-cream">
            zhyto.london
          </div>
          <div className="flex flex-col items-center md:items-center gap-2">
            <p className="text-sm md:text-base xl:text-lg text-cream tracking-[0.15em]">
              {t.footer.rights}
            </p>
            <p className="text-xs md:text-sm xl:text-base text-cream tracking-[0.1em]">
              {t.footer.designedBy}{' '}
              <a
                href="https://millionpixels.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream hover:text-white transition-colors"
              >
                Million Pixels
              </a>
            </p>
          </div>
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/privacy" className="text-sm md:text-base text-cream hover:text-white transition-colors tracking-[0.15em]">
              {t.footer.privacy}
            </Link>
            <Link href="/terms" className="text-sm md:text-base text-cream hover:text-white transition-colors tracking-[0.15em]">
              {t.footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
