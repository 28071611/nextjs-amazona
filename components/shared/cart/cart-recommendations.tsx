'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Sparkles, Plus } from 'lucide-react'
import { IProduct } from '@/lib/db/models/product.model'
import useCartStore from '@/hooks/use-cart-store'
import Image from 'next/image'
import Link from 'next/link'

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

export function CartRecommendations() {
  const [recommendations, setRecommendations] = useState<IProduct[]>([])
  const [loading, setLoading] = useState(false)
  const { addItem } = useCartStore()

  // This would typically come from your cart context
  const cartItems: CartItem[] = [
    // Mock data - in real app, this would come from cart state
  ]

  const fetchRecommendations = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/cart-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cartItems }),
      })

      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations || [])
      }
    } catch (error) {
      console.error('Cart recommendations error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (cartItems.length > 0) {
      fetchRecommendations()
    }
  }, [cartItems, fetchRecommendations])

  const handleAddToCart = (product: IProduct) => {
    addItem({
      clientId: product._id,
      product: product._id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      quantity: 1,
      countInStock: product.countInStock,
      image: product.images[0],
      price: product.price,
      size: undefined,
      color: undefined,
    }, 1)
  }

  if (cartItems.length === 0) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Cart Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Based on items in your cart, you might also like:
            </p>
            {recommendations.map((product) => (
              <div key={product._id} className="flex gap-4 p-3 border rounded-lg">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/product/${product.slug}`}
                    className="font-medium text-sm hover:text-blue-600 transition-colors line-clamp-2"
                  >
                    {product.name}
                  </Link>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                    {product.brand && (
                      <Badge variant="outline" className="text-xs">
                        {product.brand}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.listPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          ${product.listPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No recommendations available yet</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={fetchRecommendations}
            >
              Refresh Recommendations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
