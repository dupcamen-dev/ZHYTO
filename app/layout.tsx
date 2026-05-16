import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Dancing_Script, Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/components/cart-context'
import { AuthProvider } from '@/components/auth-context'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const cormorant = Cormorant_Garamond({ 
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
})

const dancing = Dancing_Script({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dancing',
})

const geist = Geist({ 
  subsets: ['latin'],
  variable: '--font-geist',
})

export const metadata: Metadata = {
  title: 'zhyto.london | Authentic Ukrainian Varenyky & Syrnyky',
  description: 'Handcrafted Ukrainian varenyky and syrnyky delivered to your door in London. Marketplace for authentic homemade cuisine.',
  keywords: ['varenyky', 'syrnyky', 'ukrainian food', 'london', 'dumplings', 'marketplace'],
  icons: {
    icon: [
      { url: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌾</text></svg>', type: 'image/svg+xml' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#1a1612',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dancing.variable} ${geist.variable} bg-background`}>
      <body className="font-serif antialiased">
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
