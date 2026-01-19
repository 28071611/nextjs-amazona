'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { IProduct } from '@/lib/db/models/product.model'

interface AddToWishlistProps {
  product: IProduct
  className?: string
}

export default function AddToWishlist({ product, className }: AddToWishlistProps) {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [loading, setLoading] = useState(false)

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch(`/api/wishlist/check/${product._id}`)
      if (response.ok) {
        const data = await response.json()
        setIsInWishlist(data.isInWishlist)
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error)
    }
  }

  useEffect(() => {
    checkWishlistStatus()
  }, [product._id, checkWishlistStatus])

  const toggleWishlist = async () => {
    if (loading) return

    setLoading(true)
    try {
      const endpoint = isInWishlist ? '/api/wishlist/remove' : '/api/wishlist/add'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: product._id }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsInWishlist(!isInWishlist)
        toast({
          description: data.message,
        })
      } else {
        toast({
          variant: 'destructive',
          description: data.error || 'Failed to update wishlist',
        })
      }
    } catch (error) {
      console.error('Toggle wishlist error:', error)
      toast({
        variant: 'destructive',
        description: 'Failed to update wishlist',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={toggleWishlist}
      disabled={loading}
    >
      <Heart
        className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`}
      />
    </Button>
  )
}
