import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

type CardItem = {
  title: string
  link: { text: string; href: string }
  items: {
    name: string
    items?: string[]
    image: string
    href: string
  }[]
}

export function HomeCard({ cards }: { cards: CardItem[] }) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12'>
      {cards.map((card) => (
        <div key={card.title} className='elite-card elite-shadow-hover group'>
          <div className='p-8 md:p-10'>
            <h3 className='elite-heading text-xl md:text-2xl font-light text-foreground mb-10 tracking-tight'>
              {card.title}
            </h3>
            <div className='grid grid-cols-2 gap-6 mb-10'>
              {card.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className='flex flex-col group/item transition-all duration-1000'
                >
                  <div className='relative overflow-hidden rounded-lg border border-border/20 hover:border-primary/30 transition-all duration-1000 bg-gradient-to-br from-background to-secondary/20'>
                    <Image
                      src={item.image}
                      alt={item.name}
                      className='aspect-square object-contain max-w-full h-auto mx-auto p-4 group-hover/item:scale-110 transition-transform duration-1000'
                      height={120}
                      width={120}
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-1000'></div>
                  </div>
                  <p className='text-center text-sm font-light mt-4 text-foreground/60 group-hover/item:text-primary transition-colors duration-1000 leading-tight whitespace-nowrap overflow-hidden text-ellipsis px-1'>
                    {item.name}
                  </p>
                </Link>
              ))}
            </div>
            {card.link && (
              <div className='text-center'>
                <Link 
                  href={card.link.href} 
                  className='inline-flex items-center text-primary hover:text-accent font-light transition-all duration-700 group/link text-sm tracking-wide'
                >
                  <span>{card.link.text}</span>
                  <svg 
                    className='w-3 h-3 ml-2 transition-transform duration-700 group-hover/link:translate-x-2' 
                    fill='none' 
                    stroke='currentColor' 
                    viewBox='0 0 24 24'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M9 5l7 7-7 7' />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
