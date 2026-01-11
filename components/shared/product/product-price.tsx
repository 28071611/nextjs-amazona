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
    <div className={cn('text-3xl', className)}>
      <span className='text-xs align-super'>{currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'}</span>
      {typeof convertedPrice === 'number' ? convertedPrice.toFixed(2) : convertedPrice}
    </div>
  ) : isDeal ? (
    <div className={cn(className)}>
      <div className='flex justify-center items-center gap-2'>
        <span className='bg-red-700 rounded-sm p-1 text-white text-sm font-semibold'>
          {Math.round(100 - (convertedPrice / convertedListPrice) * 100)}% Off
        </span>
        <span className='text-red-700 text-xs font-bold'>
          Limited time deal
        </span>
        <span className='text-red-700 text-lg font-bold'>
          <span className='text-xs align-super'>{currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'}</span>
          {typeof convertedPrice === 'number' ? convertedPrice.toFixed(2) : convertedPrice}
        </span>
      </div>
      <div className='text-muted-foreground text-xs py-2'>
        List price:{' '}
        <span className='line-through'>
          {formatCurrency(convertedListPrice, currency)}
        </span>
      </div>
    </div>
  ) : (
    <div className=''>
      <div className='flex justify-center gap-3'>
        <div className='text-3xl text-orange-700'>
          -{Math.round(100 - (convertedPrice / convertedListPrice) * 100)}%
        </div>
        <div className={cn('text-3xl', className)}>
          <span className='text-xs align-super'>{currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'}</span>
          {typeof convertedPrice === 'number' ? convertedPrice.toFixed(2) : convertedPrice}
        </div>
      </div>
      <div className='text-muted-foreground text-xs py-2'>
        List price:{' '}
        <span className='line-through'>
          {formatCurrency(convertedListPrice, currency)}
        </span>
      </div>
    </div>
  )
}

export default ProductPrice
