'use client'
import React from 'react'
import useCartSidebar from '@/hooks/use-cart-sidebar'
import CartSidebar from './cart-sidebar'
import { ThemeProvider } from './theme-provider'
import { Toaster } from '../ui/toaster'
import AppInitializer from './app-initializer'
import { ClientSetting } from '@/types'
import { SessionProvider } from 'next-auth/react'

export default function ClientProviders({
  setting,
  children,
}: {
  setting: ClientSetting
  children: React.ReactNode
}) {
  const visible = useCartSidebar()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <SessionProvider>
        <AppInitializer setting={setting}>
          <ThemeProvider
            attribute='class'
            defaultTheme={
              setting?.common?.defaultTheme?.toLocaleLowerCase() || 'light'
            }
          >
            <div className='flex min-h-screen'>
              <div className='flex-1 overflow-hidden'>{children}</div>
            </div>
            <Toaster />
          </ThemeProvider>
        </AppInitializer>
      </SessionProvider>
    )
  }

  return (
    <SessionProvider>
      <AppInitializer setting={setting}>
        <ThemeProvider
          attribute='class'
          defaultTheme={
            setting?.common?.defaultTheme?.toLocaleLowerCase() || 'light'
          }
        >
          <div className='flex min-h-screen'>
            <div className='flex-1 overflow-hidden'>{children}</div>
            {visible && <CartSidebar />}
          </div>
          <Toaster />
        </ThemeProvider>
      </AppInitializer>
    </SessionProvider>
  )
}
