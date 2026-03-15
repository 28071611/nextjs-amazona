import '../globals.css'
import ClientProviders from '@/components/shared/client-providers'
import Header from '@/components/shared/header'
import Footer from '@/components/shared/footer'
import { getSetting } from '@/lib/actions/setting.actions'
import { cookies } from 'next/headers'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import data from '@/lib/data'

export async function generateMetadata() {
  const settings = await getSetting()
  const { slogan, name, description, url } = settings?.site || data.settings[0].site
  return {
    title: {
      template: `%s | ${name}`,
      default: `${name}. ${slogan}`,
    },
    description: description,
    metadataBase: new URL(url),
  }
}

export default async function AppLayout({
  params,
  children,
}: {
  params: Promise<{ locale: string }>
  children: React.ReactNode
}) {
  const setting = await getSetting()
  const currencyCookie = (await cookies()).get('currency')
  const currency = currencyCookie ? currencyCookie.value : 'USD'

  const { locale } = await params
  const messages = await getMessages()
  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <body className="min-h-screen font-sans antialiased" suppressHydrationWarning={true}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientProviders setting={{ ...(setting || data.settings[0]), currency }}>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
