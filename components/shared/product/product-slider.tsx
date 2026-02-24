'use client'

import * as React from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import ProductCard from './product-card'
import { IProduct } from '@/lib/db/models/product.model'

export default function ProductSlider({
  title,
  products,
  hideDetails = false,
}: {
  title?: string
  products: IProduct[]
  hideDetails?: boolean
}) {
  const [api, setApi] = React.useState<any>(null)
  const [currentIndex, setCurrentIndex] = React.useState(0)
  
  React.useEffect(() => {
    if (!api) return
    
    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap() + 1)
    }
    
    api.on('select', onSelect)
    
    return () => {
      api.off('select', onSelect)
    }
  }, [api])
  
  return (
    <div className='w-full bg-background relative group'>
      {title && (
        <div className='flex items-center justify-between mb-8'>
          <h2 className='h3-bold elite-heading font-light tracking-tight'>{title}</h2>
          <div className='flex items-center gap-4 text-sm text-foreground/60'>
            <span className='font-light tracking-wide'>
              {currentIndex} / {products.length}
            </span>
          </div>
        </div>
      )}
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className='w-full'
        setApi={setApi}
      >
        <CarouselContent className='-ml-4'>
          {products.map((product, index) => (
            <CarouselItem
              key={product.slug}
              className={`pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 ${
                hideDetails ? 'md:basis-1/4 lg:basis-1/5 xl:basis-1/6' : ''
              }`}
            >
              <div className='h-full transform transition-all duration-1000 hover:scale-105'>
                <ProductCard
                  hideDetails={hideDetails}
                  hideAddToCart={false}
                  hideBorder={true}
                  product={product}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className='left-2 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-black border border-border/50 hover:border-primary text-white rounded-lg elite-glow opacity-0 group-hover:opacity-100 transition-opacity duration-700' />
        <CarouselNext className='right-2 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-black border border-border/50 hover:border-primary text-white rounded-lg elite-glow opacity-0 group-hover:opacity-100 transition-opacity duration-700' />
      </Carousel>
    </div>
  )
}
