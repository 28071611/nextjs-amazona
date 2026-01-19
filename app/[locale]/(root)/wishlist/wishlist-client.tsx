'use client'

import { useEffect, useState } from 'react'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Trash2, Heart, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { IWishlist } from '@/lib/db/models/wishlist.model'
import ProductPrice from '@/components/shared/product/product-price'

interface WishlistClientProps {
  userId: string
}

export default function WishlistClient({ userId }: WishlistClientProps) {
  const [wishlist, setWishlist] = useState<IWishlist | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/wishlist')
      const data = await response.json()
      
      if (response.ok) {
        setWishlist(data)
      } else {
        toast({
          variant: 'destructive',
          description: data.error || 'Failed to load wishlist',
        })
      }
    } catch (error) {
      console.error('Fetch wishlist error:', error)
      toast({
        variant: 'destructive',
        description: 'Failed to load wishlist',
      })
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (productId: string) => {
    try {
      const response = await fetch('/api/wishlist/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          description: data.message,
        })
        fetchWishlist() // Refresh wishlist
      } else {
        toast({
          variant: 'destructive',
          description: data.error || 'Failed to remove item',
        })
      }
    } catch (error) {
      console.error('Remove from wishlist error:', error)
      toast({
        variant: 'destructive',
        description: 'Failed to remove item',
      })
    }
  }

  const addToCart = async (productId: string) => {
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          description: 'Item added to cart',
        })
      } else {
        toast({
          variant: 'destructive',
          description: data.error || 'Failed to add item to cart',
        })
      }
    } catch (error) {
      console.error('Add to cart error:', error)
      toast({
        variant: 'destructive',
        description: 'Failed to add item to cart',
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading wishlist...</div>
      </div>
    )
  }

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h1>
          <p className="text-gray-600 mb-6">
            Start adding items you love to keep track of them here.
          </p>
          <Link href="/">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
        <p className="text-gray-600">
          You have {wishlist.items.length} {wishlist.items.length === 1 ? 'item' : 'items'} in your wishlist
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {wishlist.items.map((item) => (
          <Card key={item.product._id} className="group">
            <CardContent className="p-4">
              <div className="relative mb-4">
                <Link href={`/product/${item.product.slug}`}>
                  <div className="aspect-square overflow-hidden rounded-md bg-gray-100">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      width={200}
                      height={200}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                  onClick={() => removeFromWishlist(item.product._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Link href={`/product/${item.product.slug}`}>
                  <h3 className="font-medium text-sm line-clamp-2 hover:text-blue-600 transition-colors">
                    {item.product.name}
                  </h3>
                </Link>
                
                <p className="text-xs text-gray-500">{item.product.brand}</p>
                <p className="text-xs text-gray-500">{item.product.category}</p>
                
                <div className="flex items-center justify-between">
                  <ProductPrice
                    price={item.product.price}
                    listPrice={item.product.price * 1.2} // Assuming 20% list price
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => addToCart(item.product._id)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
