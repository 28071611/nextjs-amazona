import Link from 'next/link'
import React from 'react'

import Pagination from '@/components/shared/pagination'
import ProductCard from '@/components/shared/product/product-card'
import { Button } from '@/components/ui/button'
import { getAllProducts } from '@/lib/actions/product.actions'
import { IProduct } from '@/lib/db/models/product.model'
import ProductSortSelector from '@/components/shared/product/product-sort-selector'
import SearchFiltersClient from '@/components/shared/search/search-filters-client'

const sortOrders = [
  { value: 'price-low-to-high', name: 'Price: Low to high' },
  { value: 'price-high-to-low', name: 'Price: High to low' },
  { value: 'newest-arrivals', name: 'Newest arrivals' },
  { value: 'avg-customer-review', name: 'Avg. customer review' },
  { value: 'best-selling', name: 'Best selling' },
]

export async function generateMetadata(props: {
  searchParams: Promise<{
    q?: string
    category?: string
    tag?: string
    price?: string
    rating?: string
    page?: string
    sort?: string
  }>
}) {
  const searchParams = await props.searchParams

  return {
    title: `Search ${searchParams.q || 'Products'}`,
    description: `Search results for ${searchParams.q || 'all products'}`,
  }
}

export default async function SearchPage(props: {
  searchParams: Promise<{
    q?: string
    category?: string
    tag?: string
    price?: string
    rating?: string
    minPrice?: string
    maxPrice?: string
    page?: string
    sort?: string
  }>
}) {
  const searchParams = await props.searchParams
  const {
    q = 'all',
    category = 'all',
    tag = 'all',
    rating = 'all',
    price = 'all',
    minPrice,
    maxPrice,
    page = '1',
    sort,
  } = searchParams

  const data = await getAllProducts({
    query: q,
    category,
    tag,
    rating,
    price,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    page: Number(page),
    sort,
  })

  return (
    <div className="container-elite py-12 md:py-20">
      {/* Search Results Header */}
      <div className="elite-card elite-shadow-hover p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-foreground/80 font-light">
              {data.totalProducts === 0
                ? 'No'
                : `${data.from}-${data.to} of ${data.totalProducts}`
              }{' '}
              results
            </div>
            {(q !== 'all' && q !== '') ||
            (category !== 'all' && category !== '') ||
            (tag !== 'all' && tag !== '') ||
            (rating !== 'all') ||
            (price !== 'all')
              ? (
                <div className='flex items-center gap-2 text-sm font-light text-primary/80'>
                  <span>for</span>
                  {q !== 'all' && q !== '' && (
                    <span className="elite-text">&quot;{q}&quot;</span>
                  )}
                  {category !== 'all' && category !== '' && (
                    <span>Category: {category}</span>
                  )}
                  {tag !== 'all' && tag !== '' && (
                    <span>Tag: {tag}</span>
                  )}
                  {price !== 'all' && <span>Price: {price}</span>}
                  {rating !== 'all' && (
                    <span>Rating: {rating} & up</span>
                  )}
                </div>
              ) : null}
          </div>
          <div className='flex items-center gap-4'>
            <ProductSortSelector
              sortOrders={sortOrders}
              sort={sort || ''}
              params={searchParams}
            />
            {(q !== 'all' && q !== '') ||
            (category !== 'all' && category !== '') ||
            (tag !== 'all' && tag !== '') ||
            (rating !== 'all') ||
            (price !== 'all')
              ? (
                <Button variant={'link'} asChild className="font-light text-primary hover:text-accent">
                  <Link href='/search'>Clear</Link>
                </Button>
              ) : null}
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
        {/* Filters Sidebar */}
        <div className='lg:col-span-1'>
          <SearchFiltersClient searchParams={searchParams} />
        </div>

        {/* Products Grid */}
        <div className='lg:col-span-3 space-y-8'>
          <div className='text-center space-y-4'>
            <h2 className='h2-bold elite-heading font-light tracking-tight'>Search Results</h2>
            <div className='elite-divider max-w-32 mx-auto'></div>
            <p className='text-sm font-light text-foreground/60'>
              Check each product page for other buying options
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
            {data.products.length === 0 && (
              <div className='col-span-full text-center py-12'>
                <p className='text-foreground/60 font-light'>No product found</p>
              </div>
            )}
            {data.products.map((product: IProduct) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className='flex justify-center mt-12'>
              <Pagination page={page} totalPages={data.totalPages} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}