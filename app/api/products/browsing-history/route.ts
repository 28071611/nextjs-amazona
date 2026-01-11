import { NextRequest, NextResponse } from 'next/server'

import Product from '@/lib/db/models/product.model'
import { connectToDatabase } from '@/lib/db'

import { getProductRecommendations } from '@/lib/ai'

export const GET = async (request: NextRequest) => {
  const listType = request.nextUrl.searchParams.get('type') || 'history'
  const productIdsParam = request.nextUrl.searchParams.get('ids')
  const categoriesParam = request.nextUrl.searchParams.get('categories')

  if (!productIdsParam || !categoriesParam) {
    return NextResponse.json([])
  }

  const productIds = productIdsParam.split(',')
  const categories = categoriesParam.split(',')

  await connectToDatabase()

  if (listType === 'history') {
    const products = await Product.find({ _id: { $in: productIds } })
    return NextResponse.json(
      products.sort(
        (a, b) =>
          productIds.indexOf(a._id.toString()) -
          productIds.indexOf(b._id.toString())
      )
    )
  }

  // listType === 'related' - Use AI
  const viewedProducts = await Product.find({ _id: { $in: productIds } }).lean()
  const otherProducts = await Product.find({
    category: { $in: categories },
    _id: { $nin: productIds },
    isPublished: true,
  })
    .limit(20)
    .lean()

  if (viewedProducts.length > 0) {
    // Just use the most recent viewed product for recommendation base
    const baseProduct = viewedProducts[0]
    const recommendedIds = await getProductRecommendations(baseProduct, otherProducts as any[])
    const recommendedProducts = await Product.find({ _id: { $in: recommendedIds } }).lean()
    return NextResponse.json(recommendedProducts)
  }

  return NextResponse.json([])
}
