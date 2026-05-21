'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()
  const [position, setPosition] = useState<ToasterProps['position']>('top-center')

  useEffect(() => {
    const check = () => setPosition(window.innerWidth < 640 ? 'top-center' : 'bottom-left')
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      position={position}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
