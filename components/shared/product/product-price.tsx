'use client'

import { cn, formatCurrency } from '@/lib/utils'
import { useCurrencyStore } from '@/hooks/use-currency-store'

const ProductPrice = ({
  price,
  className,
  listPrice = 0,
  isDeal = false,
  plain = false,
}: {
  price: number
  isDeal?: boolean
  listPrice?: number
  className?: string
  plain?: boolean
}) => {
  const { currency, rates } = useCurrencyStore()
  const convertedPrice = price * rates[currency]
  const convertedListPrice = listPrice * rates[currency]

  return plain ? (
    formatCurrency(convertedPrice, currency)
  ) : listPrice == 0 ? (
    <div className={cn('text-left', className)}>
      <span className='text-2xl font-light elite-text tracking-tight'>
        <span className='text-sm align-super font-light text-primary/80'>
          {currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'}
        </span>
        {typeof convertedPrice === 'number' ? Math.round(convertedPrice).toLocaleString('en-IN') : convertedPrice}
      </span>
    </div>
  ) : isDeal ? (
    <div className={cn('text-left space-y-2', className)}>
      <div className='flex flex-wrap items-center gap-2'>
        <span className='bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-light px-2 py-1 rounded tracking-wider uppercase elite-glow'>
          {Math.round(100 - (convertedPrice / convertedListPrice) * 100)}% OFF
        </span>
        <span className='text-xs font-light text-red-600/80 tracking-wide'>
          Limited time
        </span>
      </div>
      <div className='flex items-baseline gap-2'>
        <span className='text-2xl font-light text-red-600 tracking-tight'>
          <span className='text-sm align-super font-light text-red-600/80'>
            {currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'}
          </span>
          {typeof convertedPrice === 'number' ? Math.round(convertedPrice).toLocaleString('en-IN') : convertedPrice}
        </span>
      </div>
      <div className='text-xs font-light text-foreground/40 tracking-wide'>
        List price:{' '}
        <span className='line-through text-foreground/30'>
          {formatCurrency(convertedListPrice, currency)}
        </span>
      </div>
    </div>
  ) : (
    <div className={cn('text-left space-y-2', className)}>
      <div className='flex items-baseline gap-3'>
        <div className='text-lg font-light text-primary/80 tracking-tight'>
          -{Math.round(100 - (convertedPrice / convertedListPrice) * 100)}%
        </div>
        <div className='text-2xl font-light elite-text tracking-tight'>
          <span className='text-sm align-super font-light text-primary/80'>
            {currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'}
          </span>
          {typeof convertedPrice === 'number' ? Math.round(convertedPrice).toLocaleString('en-IN') : convertedPrice}
        </div>
      </div>
      <div className='text-xs font-light text-foreground/40 tracking-wide'>
        List price:{' '}
        <span className='line-through text-foreground/30'>
          {formatCurrency(convertedListPrice, currency)}
        </span>
      </div>
    </div>
  )
}

export default ProductPrice
