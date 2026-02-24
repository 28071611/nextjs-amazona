'use client'

import * as React from 'react'
import Image from 'next/image'
import Autoplay from 'embla-carousel-autoplay'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { ICarousel } from '@/types'
export function HomeCarousel({ items }: { items: ICarousel[] }) {
  const plugin = React.useRef(
    Autoplay({ delay: 6000, stopOnInteraction: true })
  )

  const t = useTranslations('Home')

  return (
    <div className='relative overflow-hidden'>
      <Carousel
        dir='ltr'
        plugins={[plugin.current]}
        className='w-full'
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {items.map((item) => (
            <CarouselItem key={item.title}>
              <Link href={item.url} className='block group'>
                <div className='flex aspect-[16/6] md:aspect-[21/9] items-center justify-center relative overflow-hidden'>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className='object-cover group-hover:scale-105 transition-transform duration-2000 ease-out'
                    priority
                  />
                  <div className='absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent'></div>
                  <div className='absolute w-full md:w-2/3 lg:w-1/2 left-8 md:left-16 lg:left-20 top-1/2 transform -translate-y-1/2 z-10'>
                    <div className='space-y-8'>
                      <h2 className='elite-heading text-4xl md:text-6xl lg:text-7xl font-thin text-white leading-tight tracking-tight drop-shadow-2xl'>
                        {t(`${item.title}`)}
                      </h2>
                      <button className='elite-button bg-black/80 hover:bg-black/90 text-white border-black/70 hover:border-black max-w-fit backdrop-blur-sm'>
                        <span>{t(`${item.buttonCaption}`)}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className='left-6 md:left-12 bg-black/80 hover:bg-black border border-border/50 hover:border-primary text-white rounded-lg elite-glow' />
        <CarouselNext className='right-6 md:right-12 bg-black/80 hover:bg-black border border-border/50 hover:border-primary text-white rounded-lg elite-glow' />
      </Carousel>
    </div>
  )
}
