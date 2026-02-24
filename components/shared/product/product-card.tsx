'use client'

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { IProduct } from '@/lib/db/models/product.model'

import Rating from './rating'
import { formatNumber, generateId, round2 } from '@/lib/utils'
import ProductPrice from './product-price'
import ImageHover from './image-hover'
import AddToCart from './add-to-cart'
import AddToWishlist from './add-to-wishlist'

const ProductCard = ({
  product,
  hideBorder = false,
  hideDetails = false,
  hideAddToCart = false,
  hideWishlist = false,
}: {
  product: IProduct
  hideDetails?: boolean
  hideBorder?: boolean
  hideAddToCart?: boolean
  hideWishlist?: boolean
}) => {
  const [isHovered, setIsHovered] = React.useState(false)
  
  const ProductImage = () => (
    <Link href={`/product/${product.slug}`}>
      <div className='relative h-64 group'>
        {!hideWishlist && (
          <div className='absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700'>
            <AddToWishlist product={product} />
          </div>
        )}
        {product.images.length > 1 ? (
          <ImageHover
            src={product.images[0]}
            hoverSrc={product.images[1]}
            alt={product.name}
          />
        ) : (
          <div className='relative h-64 overflow-hidden rounded-lg'>
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes='80vw'
              className='object-contain transform transition-transform duration-1000 group-hover:scale-110'
            />
          </div>
        )}
        {product.tags.includes('todays-deal') && (
          <div className='absolute top-3 left-3 z-10'>
            <span className='bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-light px-3 py-1 rounded-full tracking-wider uppercase elite-glow'>
              Limited Deal
            </span>
          </div>
        )}
      </div>
    </Link>
  )
  
  const ProductDetails = () => (
    <div className='flex-1 space-y-3 px-2'>
      <p className='text-xs font-light text-primary/80 tracking-widest uppercase'>
        {product.brand}
      </p>
      <Link
        href={`/product/${product.slug}`}
        className='block group'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <h3 className='font-light text-sm leading-tight text-foreground/90 group-hover:text-primary transition-colors duration-700 line-clamp-2' 
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
          {product.name}
        </h3>
      </Link>
      <div className='flex items-center gap-2 justify-start'>
        <Rating rating={product.avgRating} size={4} />
        <span className='text-xs font-light text-foreground/50'>
          ({formatNumber(product.numReviews)})
        </span>
      </div>

      <ProductPrice
        isDeal={product.tags.includes('todays-deal')}
        price={product.price}
        listPrice={product.listPrice}
        className='text-left'
      />
    </div>
  )
  
  const AddButton = () => (
    <div className='w-full px-2 mt-3'>
      <AddToCart
        minimal
        item={{
          clientId: generateId(),
          product: product._id,
          size: product.sizes[0],
          color: product.colors[0],
          countInStock: product.countInStock,
          name: product.name,
          slug: product.slug,
          category: product.category,
          price: round2(product.price),
          quantity: 1,
          image: product.images[0],
        }}
      />
    </div>
  )

  return hideBorder ? (
    <div className='flex flex-col h-full elite-card elite-shadow-hover p-4 transition-all duration-1000 hover:scale-105'>
      <ProductImage />
      {!hideDetails && (
        <>
          <ProductDetails />
          {!hideAddToCart && <AddButton />}
        </>
      )}
    </div>
  ) : (
    <div className='flex flex-col h-full elite-card elite-shadow-hover transition-all duration-1000 hover:scale-105'>
      <div className='p-4'>
        <ProductImage />
      </div>
      {!hideDetails && (
        <>
          <div className='flex-1 px-4'>
            <ProductDetails />
          </div>
          <div className='p-4'>
            {!hideAddToCart && <AddButton />}
          </div>
        </>
      )}
    </div>
  )
}

export default ProductCard
