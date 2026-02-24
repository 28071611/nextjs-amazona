'use client'
import { ChevronUp } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import useSettingStore from '@/hooks/use-setting-store'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select'

import { SelectValue } from '@radix-ui/react-select'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { i18n } from '@/i18n-config'

export default function Footer() {
  const router = useRouter()
  const pathname = usePathname()
  const {
    setting: { site, availableCurrencies, currency },
    setCurrency,
  } = useSettingStore()
  const { locales } = i18n

  const locale = useLocale()
  const t = useTranslations()
  return (
    <footer className='bg-card text-muted-foreground border-t border-border/50'>
      <div className='w-full'>
        <Button
          variant='ghost'
          className='w-full rounded-none bg-background/50 hover:bg-primary/10 hover:text-primary transition-colors h-12 uppercase tracking-widest text-xs font-medium border-b border-border/50'
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ChevronUp className='mr-2 h-4 w-4' />
          {t('Footer.Back to top')}
        </Button>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-12 p-12 max-w-7xl mx-auto'>
          <div>
            <h3 className='font-serif text-xl font-medium mb-6 text-foreground tracking-wide'>{t('Footer.Get to Know Us')}</h3>
            <ul className='space-y-4 text-sm font-light'>
              <li>
                <Link href='/page/careers' className='hover:text-primary transition-colors'>{t('Footer.Careers')}</Link>
              </li>
              <li>
                <Link href='/page/blog' className='hover:text-primary transition-colors'>{t('Footer.Blog')}</Link>
              </li>
              <li>
                <Link href='/page/about-us' className='hover:text-primary transition-colors'>
                  {t('Footer.About name', { name: site.name })}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className='font-serif text-xl font-medium mb-6 text-foreground tracking-wide'>{t('Footer.Make Money with Us')}</h3>
            <ul className='space-y-4 text-sm font-light'>
              <li>
                <Link href='/page/sell' className='hover:text-primary transition-colors'>
                  {t('Footer.Sell products on', { name: site.name })}
                </Link>
              </li>
              <li>
                <Link href='/page/become-affiliate' className='hover:text-primary transition-colors'>
                  {t('Footer.Become an Affiliate')}
                </Link>
              </li>
              <li>
                <Link href='/page/advertise' className='hover:text-primary transition-colors'>
                  {t('Footer.Advertise Your Products')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className='font-serif text-xl font-medium mb-6 text-foreground tracking-wide'>{t('Footer.Let Us Help You')}</h3>
            <ul className='space-y-4 text-sm font-light'>
              <li>
                <Link href='/page/shipping' className='hover:text-primary transition-colors'>
                  {t('Footer.Shipping Rates & Policies')}
                </Link>
              </li>
              <li>
                <Link href='/page/returns-policy' className='hover:text-primary transition-colors'>
                  {t('Footer.Returns & Replacements')}
                </Link>
              </li>
              <li>
                <Link href='/page/help' className='hover:text-primary transition-colors'>{t('Footer.Help')}</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className='border-t border-border/50 bg-background/30'>
          <div className='max-w-7xl mx-auto py-10 px-4 flex flex-col items-center space-y-6'>
            <div className='flex items-center space-x-6 flex-wrap justify-center'>
              <div className='flex items-center gap-2'>
                <Image
                  src='/icons/logo.svg'
                  alt={`${site.name} logo`}
                  width={32}
                  height={32}
                  className='opacity-80'
                />
                <span className='font-serif text-lg text-foreground tracking-wide'>{site.name}</span>
              </div>
              <div className='flex gap-4'>
                <Select
                  value={locale}
                  onValueChange={(value) => {
                    router.push(pathname, { locale: value })
                  }}
                >
                  <SelectTrigger className="bg-transparent border-border/60 hover:border-primary/50 text-xs w-[140px]">
                    <SelectValue placeholder={t('Footer.Select a language')} />
                  </SelectTrigger>
                  <SelectContent>
                    {locales.map((lang, index) => (
                      <SelectItem key={index} value={lang.code}>
                        <Link
                          className='w-full flex items-center gap-2'
                          href={pathname}
                          locale={lang.code}
                        >
                          <span>{lang.icon}</span> {lang.name}
                        </Link>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={currency}
                  onValueChange={(value) => {
                    setCurrency(value)
                    window.scrollTo(0, 0)
                  }}
                >
                  <SelectTrigger className="bg-transparent border-border/60 hover:border-primary/50 text-xs w-[140px]">
                    <SelectValue placeholder={t('Footer.Select a currency')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCurrencies
                      .filter((x) => x.code)
                      .map((currency, index) => (
                        <SelectItem key={index} value={currency.code}>
                          {currency.name} ({currency.code})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='bg-background py-8 border-t border-border/50'>
        <div className='max-w-7xl mx-auto px-4 text-center'>
          <div className='flex justify-center gap-6 text-xs text-muted-foreground uppercase tracking-wider mb-4'>
            <Link href='/page/conditions-of-use' className='hover:text-primary transition-colors'>
              {t('Footer.Conditions of Use')}
            </Link>
            <Link href='/page/privacy-policy' className='hover:text-primary transition-colors'>{t('Footer.Privacy Notice')}</Link>
            <Link href='/page/help' className='hover:text-primary transition-colors'>{t('Footer.Help')}</Link>
          </div>
          <p className='text-xs text-muted-foreground/60 font-serif italic'>
            © {new Date().getFullYear()} {site.name}. All rights reserved. {site.copyright}
          </p>
          <div className='mt-2 text-xs text-muted-foreground/40'>
            {site.address} | {site.phone}
          </div>
        </div>
      </div>
    </footer>
  )
}
