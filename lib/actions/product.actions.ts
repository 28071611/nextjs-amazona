'use server'

import { connectToDatabase } from '@/lib/db'
import Product, { IProduct } from '@/lib/db/models/product.model'
import { revalidatePath } from 'next/cache'
import { getCachedProducts, getCachedProductById, getCachedCategories, invalidateProductCache } from './cached-product.actions'
import { formatError } from '../utils'
import { ProductInputSchema, ProductUpdateSchema } from '../validator'
import { IProductInput } from '@/types'
import { z } from 'zod'
import { getSetting } from './setting.actions'
import { getProductRecommendations, refineSearchQuery, suggestDiscounts } from '../ai'
import { auth } from '@/auth'

// CREATE
export async function createProduct(data: IProductInput) {
  try {
    const product = ProductInputSchema.parse(data)
    await connectToDatabase()
    const session = await auth()
    if (!session?.user) throw new Error('User not found')

    // If user is seller, assign product to them
    if (session.user.role === 'Seller') {
      (product as any).seller = session.user.id
    }

    await Product.create(product)
    revalidatePath('/admin/products')
    // Invalidate cache after creating
    await invalidateProductCache()
    return {
      success: true,
      message: 'Product created successfully',
    }
  } catch (error) {
    console.error('Create product error:', error)
    return { success: false, message: formatError(error) }
  }
}

// UPDATE
export async function updateProduct(data: z.infer<typeof ProductUpdateSchema>) {
  try {
    const product = ProductUpdateSchema.parse(data)
    await connectToDatabase()
    const session = await auth()
    if (!session?.user) throw new Error('User not authenticated')

    const productToUpdate = await Product.findById(product._id)
    if (!productToUpdate) throw new Error('Product not found')

    if (session.user.role === 'Seller' && productToUpdate.seller && productToUpdate.seller.toString() !== session.user.id) {
      throw new Error('Not authorized to update this product')
    }

    await Product.findByIdAndUpdate(product._id, product)
    revalidatePath('/admin/products')
    revalidatePath('/seller/products')
    // Invalidate cache after updating
    await invalidateProductCache()
    return {
      success: true,
      message: 'Product updated successfully',
    }
  } catch (error) {
    console.error('Update product error:', error)
    return { success: false, message: formatError(error) }
  }
}

// DELETE
export async function deleteProduct(id: string) {
  try {
    await connectToDatabase()
    const session = await auth()
    if (!session?.user) throw new Error('User not authenticated')

    const product = await Product.findById(id)
    if (!product) throw new Error('Product not found')

    if (session.user.role === 'Seller' && product.seller && product.seller.toString() !== session.user.id) {
      throw new Error('Not authorized to delete this product')
    }
    await Product.findByIdAndDelete(id)
    revalidatePath('/admin/products')
    revalidatePath('/seller/products')
    // Invalidate cache after deleting
    await invalidateProductCache()
    return {
      success: true,
      message: 'Product deleted successfully',
    }
  } catch (error) {
    console.error('Delete product error:', error)
    return { success: false, message: formatError(error) }
  }
}

// GET ONE PRODUCT BY ID
export async function getProductById(productId: string) {
  await connectToDatabase()
  const product = await Product.findById(productId)
  return JSON.parse(JSON.stringify(product)) as IProduct
}

// GET ALL PRODUCTS FOR ADMIN
export async function getAllProductsForAdmin({
  query,
  page = 1,
  sort = 'latest',
  limit,
}: {
  query: string
  page?: number
  sort?: string
  limit?: number
}) {
  await connectToDatabase()

  const {
    common: { pageSize },
  } = await getSetting()
  limit = limit || pageSize
  const queryFilter =
    query && query !== 'all'
      ? {
        name: {
          $regex: query,
          $options: 'i',
        },
      }
      : {}

  const order: Record<string, 1 | -1> =
    sort === 'best-selling'
      ? { numSales: -1 }
      : sort === 'price-low-to-high'
        ? { price: 1 }
        : sort === 'price-high-to-low'
          ? { price: -1 }
          : sort === 'avg-customer-review'
            ? { avgRating: -1 }
            : { _id: -1 }
  const limitValue = limit || 10
  const products = await Product.find({
    ...queryFilter,
  })
    .sort(order)
    .skip(limitValue * (Number(page) - 1))
    .limit(limitValue)
    .lean()

  const countProducts = await Product.countDocuments({
    ...queryFilter,
  })
  return {
    products: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalPages: Math.ceil(countProducts / limitValue),
    totalProducts: countProducts,
    from: limitValue * (Number(page) - 1) + 1,
    to: limitValue * (Number(page) - 1) + products.length,
  }
}


export async function getAllProductsForSeller({
  query,
  page = 1,
  sort = 'latest',
  limit,
}: {
  query: string
  page?: number
  sort?: string
  limit?: number
}) {
  await connectToDatabase()
  const session = await auth()
  if (!session?.user || session.user.role !== 'Seller') {
    throw new Error('Unauthorized')
  }
  const sellerId = session.user.id

  const {
    common: { pageSize },
  } = await getSetting()
  limit = limit || pageSize
  const queryFilter =
    query && query !== 'all'
      ? {
        name: {
          $regex: query,
          $options: 'i',
        },
      }
      : {}

  const sellerFilter = { seller: sellerId }

  const order: Record<string, 1 | -1> =
    sort === 'best-selling'
      ? { numSales: -1 }
      : sort === 'price-low-to-high'
        ? { price: 1 }
        : sort === 'price-high-to-low'
          ? { price: -1 }
          : sort === 'avg-customer-review'
            ? { avgRating: -1 }
            : { _id: -1 }
  const limitValue = limit || 10
  const products = await Product.find({
    ...queryFilter,
    ...sellerFilter
  })
    .sort(order)
    .skip(limitValue * (Number(page) - 1))
    .limit(limitValue)
    .lean()

  const countProducts = await Product.countDocuments({
    ...queryFilter,
    ...sellerFilter
  })
  return {
    products: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalPages: Math.ceil(countProducts / limitValue),
    totalProducts: countProducts,
    from: limitValue * (Number(page) - 1) + 1,
    to: limitValue * (Number(page) - 1) + products.length,
  }
}

export async function getAllCategories() {
  await connectToDatabase()
  const categories = await Product.find({ isPublished: true }).distinct(
    'category'
  )
  return categories
}

export async function getCategoryCards() {
  await connectToDatabase()
  const categories = await Product.find({ isPublished: true }).distinct(
    'category'
  )
  const cards = await Promise.all(
    categories.slice(0, 4).map(async (category) => {
      const product = await Product.findOne(
        { category, isPublished: true },
        { images: 1 }
      ).sort({ createdAt: -1 })
      return {
        name: category,
        image: product?.images[0] || '/images/t-shirts.jpg',
        href: `/search?category=${category}`,
      }
    })
  )
  return cards
}
export async function getProductsForCard({
  tag,
  limit = 4,
}: {
  tag: string
  limit?: number
}) {
  await connectToDatabase()
  const products = await Product.find(
    { tags: { $in: [tag] }, isPublished: true },
    {
      name: 1,
      href: { $concat: ['/product/', '$slug'] },
      image: { $arrayElemAt: ['$images', 0] },
    }
  )
    .sort({ createdAt: 'desc' })
    .limit(limit)
  return JSON.parse(JSON.stringify(products)) as {
    name: string
    href: string
    image: string
  }[]
}
// GET PRODUCTS BY TAG
export async function getProductsByTag({
  tag,
  limit = 10,
}: {
  tag: string
  limit?: number
}) {
  try {
    await connectToDatabase()
    const products = await Product.find({
      tags: { $in: [tag] },
      isPublished: true,
    })
      .sort({ createdAt: 'desc' })
      .limit(limit)
    return JSON.parse(JSON.stringify(products)) as IProduct[]
  } catch (error) {
    console.error('getProductsByTag error:', error)
    return []
  }
}

// GET ONE PRODUCT BY SLUG
export async function getProductBySlug(slug: string) {
  await connectToDatabase()
  const product = await Product.findOne({ slug, isPublished: true }).populate('seller', 'name')
  if (!product) throw new Error('Product not found')
  return JSON.parse(JSON.stringify(product)) as IProduct
}
// GET RELATED PRODUCTS: PRODUCTS WITH SAME CATEGORY
export async function getRelatedProductsByCategory({
  category,
  productId,
  limit = 4,
  page = 1,
}: {
  category: string
  productId: string
  limit?: number
  page: number
}) {
  const {
    common: { pageSize },
  } = await getSetting()
  limit = limit || pageSize
  await connectToDatabase()
  const skipAmount = (Number(page) - 1) * limit
  const conditions = {
    isPublished: true,
    category,
    _id: { $ne: productId },
  }
  const products = await Product.find(conditions)
    .sort({ numSales: 'desc' })
    .skip(skipAmount)
    .limit(limit)
  const productsCount = await Product.countDocuments(conditions)
  return {
    data: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalPages: Math.ceil(productsCount / limit),
  }
}

// GET ALL PRODUCTS
export async function getAllProducts({
  query,
  limit,
  page,
  category,
  tag,
  price,
  rating,
  sort,
  minPrice,
  maxPrice,
}: {
  query: string
  category: string
  tag: string
  limit?: number
  page: number
  price?: string
  rating?: string
  sort?: string
  minPrice?: number
  maxPrice?: number
}) {
  try {
    const {
      common: { pageSize },
    } = await getSetting()
    limit = limit || pageSize
    await connectToDatabase()

    let refinedQuery = query
    let refinedCategory = category
    let refinedBrand = ''

    if (query && query !== 'all' && query.split(' ').length > 1) {
      const refinement = await refineSearchQuery(query)
      if (refinement) {
        refinedQuery = refinement.query || query
        refinedCategory = refinement.category || category
        refinedBrand = refinement.brand || ''
      }
    }

    const queryFilter =
      refinedQuery && refinedQuery !== 'all'
        ? {
          name: {
            $regex: refinedQuery,
            $options: 'i',
          },
        }
        : {}
    const categoryFilter = refinedCategory && refinedCategory !== 'all' ? { category: refinedCategory } : {}
    const brandFilter = refinedBrand ? { brand: refinedBrand } : {}
    const tagFilter = tag && tag !== 'all' ? { tags: tag } : {}

    const ratingFilter =
      rating && rating !== 'all'
        ? {
          avgRating: {
            $gte: Number(rating),
          },
        }
        : {}
    const priceFilter =
      price && price !== 'all'
        ? {
          price: {
            $gte: Number(price.split('-')[0]),
            $lte: Number(price.split('-')[1]),
          },
        }
        : minPrice !== undefined || maxPrice !== undefined
          ? {
            price: {
              ...(minPrice !== undefined && { $gte: minPrice }),
              ...(maxPrice !== undefined && { $lte: maxPrice }),
            },
          }
          : {}
    const order: Record<string, 1 | -1> =
      sort === 'best-selling'
        ? { numSales: -1 }
        : sort === 'price-low-to-high'
          ? { price: 1 }
          : sort === 'price-high-to-low'
            ? { price: -1 }
            : sort === 'avg-customer-review'
              ? { avgRating: -1 }
              : { _id: -1 }
    const isPublished = { isPublished: true }
    const limitValue = limit || 10
    const products = await Product.find({
      ...isPublished,
      ...queryFilter,
      ...tagFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .sort(order)
      .skip(limitValue * (Number(page) - 1))
      .limit(limitValue)
      .lean()

    const countProducts = await Product.countDocuments({
      ...queryFilter,
      ...tagFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    })
    return {
      products: JSON.parse(JSON.stringify(products)) as IProduct[],
      totalPages: Math.ceil(countProducts / limitValue),
      totalProducts: countProducts,
      from: limitValue * (Number(page) - 1) + 1,
      to: limitValue * (Number(page) - 1) + products.length,
    }
  } catch (error) {
    console.error('getAllProducts error:', error)
    return {
      products: [],
      totalPages: 0,
      totalProducts: 0,
      from: 0,
      to: 0,
    }
  }
}

export async function getAllTags() {
  const tags = await Product.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: null, uniqueTags: { $addToSet: '$tags' } } },
    { $project: { _id: 0, uniqueTags: 1 } },
  ])
  return (
    (tags[0]?.uniqueTags
      .sort((a: string, b: string) => a.localeCompare(b))
      .map((x: string) =>
        x
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      ) as string[]) || []
  )
}

export async function getAllBrands() {
  const brands = await Product.aggregate([
    { $group: { _id: null, uniqueBrands: { $addToSet: '$brand' } } },
    { $project: { _id: 0, uniqueBrands: 1 } },
  ])
  return (
    (brands[0]?.uniqueBrands
      .sort((a: string, b: string) => a.localeCompare(b))
      .filter((brand: string) => brand && brand.trim() !== '') as string[]) || []
  )
}

// AI RECOMMENDATIONS

export async function getAIRecommendations(productId: string) {
  try {
    await connectToDatabase()
    const product = await Product.findById(productId)
    if (!product) throw new Error('Product not found')

    // Get a sample of other products to recommend from
    const otherProducts = await Product.find({
      _id: { $ne: productId },
      isPublished: true,
    })
      .limit(20)
      .lean()

    const recommendedIds = await getProductRecommendations(
      product,
      otherProducts as any[]
    )

    const recommendedProducts = await Product.find({
      _id: { $in: recommendedIds },
    }).lean()

    return JSON.parse(JSON.stringify(recommendedProducts)) as IProduct[]
  } catch (error) {
    console.error('Error in getAIRecommendations:', error)
    return []
  }
}

// AI CART RECOMMENDATIONS
import { getCartRecommendations } from '../ai'

export async function getAICartRecommendations(cartItems: any[]) {
  try {
    await connectToDatabase()
    const allProducts = await Product.find({ isPublished: true }).limit(20).lean()
    const recommendedIds = await getCartRecommendations(cartItems, allProducts as any[])
    const recommendedProducts = await Product.find({ _id: { $in: recommendedIds } }).lean()
    return JSON.parse(JSON.stringify(recommendedProducts)) as IProduct[]
  } catch (error) {
    console.error('Error in getAICartRecommendations:', error)
    return []
  }
}
