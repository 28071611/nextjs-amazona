import { NextRequest, NextResponse } from 'next/server'
import { getCartRecommendations } from '@/lib/ai'
import { getAllProducts } from '@/lib/actions/product.actions'

export async function POST(request: NextRequest) {
  try {
    const { cartItems } = await request.json()
    
    if (!cartItems || !Array.isArray(cartItems)) {
      return NextResponse.json({ error: 'Cart items are required' }, { status: 400 })
    }

    // Get all products for recommendation context
    const allProducts = await getAllProducts({ 
      query: 'all', 
      category: 'all', 
      tag: 'all', 
      limit: 100, 
      page: 1 
    })

    const recommendedProductIds = await getCartRecommendations(
      cartItems,
      allProducts.products
    )

    // Get full product details for recommended items
    const recommendedProducts = allProducts.products.filter((product: any) =>
      recommendedProductIds.includes(product._id.toString())
    )

    return NextResponse.json({ 
      recommendations: recommendedProducts 
    })
  } catch (error) {
    console.error('Cart recommendations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
