import Image from 'next/image'
import { Link } from '@/i18n'
import { getAllCategories } from '@/lib/actions/product.actions'
import Menu from './menu'
import Search from './search'
import data from '@/lib/data'
import Sidebar from './sidebar'
import { getSetting } from '@/lib/actions/setting.actions'

export default async function Header() {
  const categories = await getAllCategories()
  const settings = await getSetting()
  const site = (settings || data.settings[0]).site

  return (
    <header className='sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-all'>
      <div className='wrapper py-3'>
        <div className='flex items-center justify-between gap-4'>
          <div className='flex items-center'>
            <Link
              href='/'
              className='flex items-center gap-2 transition-opacity hover:opacity-90'
            >
              <Image
                src={site.logo}
                width={40}
                height={40}
                alt={`${site.name} logo`}
                className="brightness-125"
              />
              <span className='text-2xl font-bold tracking-tighter text-gold font-serif'>
                {site.name}
              </span>
            </Link>
          </div>

          <div className='hidden md:block flex-1 max-w-2xl px-8'>
            <Search />
          </div>
          <Menu />
        </div>
        <div className='flex items-center justify-center gap-6 px-4 py-2 bg-gradient-to-r from-card via-background to-card border-b border-border/40 text-sm font-medium tracking-wide overflow-x-auto'>
          <Sidebar categories={categories} />
          <div className='flex items-center gap-6'>
            {data.headerMenus.map((menu) => (
              <Link
                href={menu.href}
                key={menu.href}
                className='text-muted-foreground hover:text-primary transition-colors duration-300 uppercase text-xs tracking-widest'
              >
                {menu.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
