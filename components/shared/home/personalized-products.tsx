'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
      <Card className='w-full rounded-none'>
        <CardContent className='p-4 items-center gap-3'>
          <div className='space-y-4'>
            <Skeleton className='h-8 w-64' />
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              {[...Array(4)].map((_, i) => (
                <div key={i} className='space-y-2'>
                  <Skeleton className='h-48 w-full' />
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-4 w-1/2' />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <Card className='w-full rounded-none'>
      <CardContent className='p-4 items-center gap-3'>
        <ProductSlider title="Recommended For You" products={products} />
      </CardContent>
    </Card>
  )
}
