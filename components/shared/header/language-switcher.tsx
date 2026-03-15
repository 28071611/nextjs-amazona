'use client'

import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDownIcon } from 'lucide-react'
import { Link, useRouter, usePathname } from '@/i18n'
import { useLocale } from 'next-intl'
import { i18n } from '@/i18n-config'

export default function LanguageSwitcher() {
  const { locales } = i18n
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleLocaleChange = (newLocale: string) => {
    router.push(pathname, { locale: newLocale })
  }

  const currentLocaleData = i18n.locales.find(l => l.code === locale)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='header-button h-[41px]'>
        <div className='flex items-center gap-1'>
          <span className='text-xl'>
            {currentLocaleData?.icon || '🌐'}
          </span>
          {locale.toUpperCase().split('-')[0]}
          <ChevronDownIcon />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        <DropdownMenuLabel>Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={handleLocaleChange}
        >
          {i18n.locales.map((l) => (
            <DropdownMenuRadioItem key={l.code} value={l.code}>
              {l.icon} {l.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
