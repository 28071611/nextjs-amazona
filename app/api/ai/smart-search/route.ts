import { NextRequest, NextResponse } from 'next/server'
import { refineSearchQuery } from '@/lib/ai'
import { getAllProducts } from '@/lib/actions/product.actions'

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Use AI to refine the search query
    const refinedQuery = await refineSearchQuery(query)
    
    // Get all products and filter based on refined query
    const allProducts = await getAllProducts({ 
      query: refinedQuery.query || 'all', 
      category: 'all', 
      tag: 'all', 
      limit: 50, 
      page: 1 
    })
    
    // Further filter by category if AI detected one
    let filteredProducts = allProducts.products
    if (refinedQuery.category) {
      filteredProducts = allProducts.products.filter((product: any) => 
        product.category.toLowerCase().includes(refinedQuery.category.toLowerCase())
      )
    }
    
    // Further filter by brand if AI detected one
    if (refinedQuery.brand) {
      filteredProducts = filteredProducts.filter((product: any) => 
        product.brand?.toLowerCase().includes(refinedQuery.brand.toLowerCase())
      )
    }

    return NextResponse.json({ 
      products: filteredProducts,
      refinedQuery,
      originalQuery: query
    })
  } catch (error) {
    console.error('Smart search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
