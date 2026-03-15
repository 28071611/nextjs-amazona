import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'
import { getRequestConfig } from 'next-intl/server'

export const routing = defineRouting({
  locales: ['en-US', 'fr', 'ar'],
  defaultLocale: 'en-US'
})

export type Locale = (typeof routing.locales)[number]

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
