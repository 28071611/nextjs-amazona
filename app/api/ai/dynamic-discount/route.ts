import { NextRequest, NextResponse } from 'next/server'
import { suggestDiscounts } from '@/lib/ai'
import { getAllProducts } from '@/lib/actions/product.actions'

export async function POST(request: NextRequest) {
  try {
    const { products } = await request.json()
    
    if (!products || !Array.isArray(products)) {
      // If no products provided, get all products
      const allProducts = await getAllProducts({ 
        query: 'all', 
        category: 'all', 
        tag: 'all', 
        limit: 100, 
        page: 1 
      })
      
      const discountSuggestions = await suggestDiscounts(allProducts.products)
      
      return NextResponse.json({ 
        discounts: discountSuggestions 
      })
    }

    const discountSuggestions = await suggestDiscounts(products)

    return NextResponse.json({ 
      discounts: discountSuggestions 
    })
  } catch (error) {
    console.error('Dynamic discount error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
