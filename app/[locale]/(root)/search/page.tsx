import Link from 'next/link'
import React from 'react'

import Pagination from '@/components/shared/pagination'
import ProductCard from '@/components/shared/product/product-card'
import { Button } from '@/components/ui/button'
import { getAllProducts } from '@/lib/actions/product.actions'
import { IProduct } from '@/lib/db/models/product.model'
import ProductSortSelector from '@/components/shared/product/product-sort-selector'
import { getTranslations } from 'next-intl/server'

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
    page = '1',
    sort,
  } = searchParams

  const data = await getAllProducts({
    query: q,
    category,
    tag,
    rating,
    price,
    page: Number(page),
    sort,
  })
  const t = await getTranslations()
  return (
    <div className="container mx-auto px-4 py-8">
      <div className='my-2 bg-card md:border-b flex-between flex-col md:flex-row '>
        <div className='flex items-center'>
          {data.totalProducts === 0
            ? t('Search.No')
            : `${data.from}-${data.to} ${t('Search.of')} ${
                data.totalProducts
              }`}{' '}
          {t('Search.results')}
          {(q !== 'all' && q !== '') ||
          (category !== 'all' && category !== '') ||
          (tag !== 'all' && tag !== '') ||
          (rating !== 'all') ||
          (price !== 'all')
            ? ` ${t('Search.for')} `
            : null}
          {q !== 'all' && q !== '' && '"' + q + '"'}
          {category !== 'all' &&
            category !== '' &&
            `   ${t('Search.Category')}: ` + category}
          {tag !== 'all' && tag !== '' && `   ${t('Search.Tag')}: ` + tag}
          {price !== 'all' && `    ${t('Search.Price')}: ` + price}
          {rating !== 'all' && `    ${t('Search.Rating')}: ` + rating + ` & ${t('Search.up')}`}
          &nbsp;
          {(q !== 'all' && q !== '') ||
          (category !== 'all' && category !== '') ||
          (tag !== 'all' && tag !== '') ||
          (rating !== 'all') ||
          (price !== 'all')
            ? (
            <Button variant={'link'} asChild>
              <Link href='/search'>{t('Search.Clear')}</Link>
            </Button>
          ) : null}
        </div>
        <div>
          <ProductSortSelector
            sortOrders={sortOrders}
            sort={sort || ''}
            params={searchParams}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
        <div className='md:col-span-1'>
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>{t('Search.Filters')}</h3>
            <div className='text-sm text-gray-600'>
              {t('Search.Filter options coming soon')}
            </div>
          </div>
        </div>

        <div className='md:col-span-4 space-y-4'>
          <div>
            <div className='font-bold text-xl'>{t('Search.Results')}</div>
            <div>
              {t('Search.Check each product page for other buying options')}
            </div>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2  lg:grid-cols-3  '>
            {data.products.length === 0 && (
              <div>{t('Search.No product found')}</div>
            )}
            {data.products.map((product: IProduct) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          {data.totalPages > 1 && (
            <Pagination page={page} totalPages={data.totalPages} />
          )}
        </div>
      </div>
    </div>
  )
}