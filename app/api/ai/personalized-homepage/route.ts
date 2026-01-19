import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getAllProducts } from '@/lib/actions/product.actions'
import { getProductRecommendations } from '@/lib/ai'

export async function GET(request: NextRequest) {
  try {
    // For homepage, we don't require authentication
    // Get featured products as recommendations for all users
    const allProducts = await getAllProducts({ 
      query: 'all', 
      category: 'all', 
      tag: 'featured', 
      limit: 10, 
      page: 1 
    })

    // Use featured products as recommendations
    const personalizedProducts = allProducts.products.slice(0, 8)

    return NextResponse.json({ products: personalizedProducts })
  } catch (error) {
    console.error('Personalized homepage error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
