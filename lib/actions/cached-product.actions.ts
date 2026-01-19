'use server'

import { connectToDatabase } from '@/lib/db'
import Product, { IProduct } from '@/lib/db/models/product.model'
import { RedisCache, CACHE_KEYS, CACHE_TTL } from '@/lib/redis'
import { revalidatePath } from 'next/cache'

export async function getCachedProducts(): Promise<IProduct[]> {
  try {
    // Try to get from cache first
    const cachedProducts = await RedisCache.get(CACHE_KEYS.PRODUCTS)
    
    if (cachedProducts) {
      console.log('Products retrieved from cache')
      return cachedProducts as IProduct[]
    }

    // If not in cache, fetch from database and cache it
    await connectToDatabase()
    const products = await Product.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    const jsonProducts = JSON.parse(JSON.stringify(products)) as IProduct[]

    // Cache the products
    await RedisCache.set(CACHE_KEYS.PRODUCTS, jsonProducts, CACHE_TTL.PRODUCTS)
    console.log('Products cached successfully')

    return jsonProducts
  } catch (error) {
    console.error('Get cached products error:', error)
    return []
  }
}

export async function getCachedProductById(productId: string): Promise<IProduct | null> {
  try {
    const cacheKey = `${CACHE_KEYS.PRODUCT_DETAIL}${productId}`
    
    // Try to get from cache first
    const cachedProduct = await RedisCache.get(cacheKey)
    
    if (cachedProduct) {
      console.log(`Product ${productId} retrieved from cache`)
      return cachedProduct
    }

    // If not in cache, fetch from database and cache it
    await connectToDatabase()
    const product = await Product.findById(productId).lean()
    
    if (product) {
      const jsonProduct = JSON.parse(JSON.stringify(product)) as IProduct
      // Cache the product
      await RedisCache.set(cacheKey, jsonProduct, CACHE_TTL.PRODUCT_DETAIL)
      console.log(`Product ${productId} cached successfully`)
      return jsonProduct
    }

    return product
  } catch (error) {
    console.error('Get cached product error:', error)
    return null
  }
}

export async function getCachedCategories(): Promise<string[]> {
  try {
    // Try to get from cache first
    const cachedCategories = await RedisCache.get(CACHE_KEYS.CATEGORIES)
    
    if (cachedCategories) {
      console.log('Categories retrieved from cache')
      return cachedCategories
    }

    // If not in cache, fetch from database and cache it
    await connectToDatabase()
    const products = await Product.find({ isPublished: true }).select('category')
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))]
    
    // Cache the categories
    await RedisCache.set(CACHE_KEYS.CATEGORIES, categories, CACHE_TTL.CATEGORIES)
    console.log('Categories cached successfully')

    return categories
  } catch (error) {
    console.error('Get cached categories error:', error)
    return []
  }
}

export async function invalidateProductCache(): Promise<void> {
  try {
    await RedisCache.delPattern(`${CACHE_KEYS.PRODUCTS}*`)
    await RedisCache.delPattern(`${CACHE_KEYS.PRODUCT_DETAIL}*`)
    await RedisCache.delPattern(`${CACHE_KEYS.CATEGORIES}*`)
    console.log('Product cache invalidated')
  } catch (error) {
    console.error('Invalidate product cache error:', error)
  }
}

export async function warmupProductCache(): Promise<void> {
  try {
    console.log('Warming up product cache...')
    await getCachedProducts()
    await getCachedCategories()
    console.log('Product cache warmed up')
  } catch (error) {
    console.error('Warmup product cache error:', error)
  }
}
