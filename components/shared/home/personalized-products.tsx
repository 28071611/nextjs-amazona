'use client'

import { useEffect, useState } from 'react'
import ProductSlider from '@/components/shared/product/product-slider'
import { Skeleton } from '@/components/ui/skeleton'
import { IProduct } from '@/lib/db/models/product.model'

export function PersonalizedProducts() {
  const [products, setProducts] = useState<IProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPersonalizedProducts = async () => {
      try {
        const response = await fetch('/api/ai/personalized-homepage')
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || [])
        } else {
          console.warn('Personalized products API returned:', response.status)
          setProducts([])
        }
      } catch (error) {
        console.error('Failed to fetch personalized products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchPersonalizedProducts()
  }, [])

  if (loading) {
    return (
      <div className='elite-card elite-shadow-hover p-8 md:p-12'>
        <div className='space-y-6'>
          <div className='h-8 w-64 bg-muted/20 rounded animate-pulse'></div>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
            {[...Array(4)].map((_, i) => (
              <div key={i} className='space-y-4'>
                <div className='h-64 bg-muted/10 rounded-lg animate-pulse'></div>
                <div className='h-4 bg-muted/20 rounded w-3/4 animate-pulse'></div>
                <div className='h-4 bg-muted/20 rounded w-1/2 animate-pulse'></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className='space-y-6'>
      <div className='text-center space-y-4'>
        <h2 className='h2-bold elite-heading font-light tracking-tight'>Recommended For You</h2>
        <div className='elite-divider max-w-32 mx-auto'></div>
      </div>
      <ProductSlider products={products} />
    </div>
  )
}
