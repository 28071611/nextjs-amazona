'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { X, Tag } from 'lucide-react'

interface CouponInputProps {
  onCouponApplied: (discount: number, couponCode: string) => void
  orderAmount: number
}

export default function CouponInput({ onCouponApplied, orderAmount }: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        variant: 'destructive',
        description: 'Please enter a coupon code',
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          orderAmount,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setAppliedCoupon({
          code: couponCode.trim().toUpperCase(),
          discount: data.discount,
        })
        onCouponApplied(data.discount, couponCode.trim().toUpperCase())
        toast({
          description: data.message,
        })
        setCouponCode('')
      } else {
        toast({
          variant: 'destructive',
          description: data.message || 'Failed to apply coupon',
        })
      }
    } catch (error) {
      console.error('Apply coupon error:', error)
      toast({
        variant: 'destructive',
        description: 'Failed to apply coupon',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    onCouponApplied(0, '')
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="h-4 w-4" />
          <h3 className="font-medium">Coupon Code</h3>
        </div>

        {appliedCoupon ? (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-600">
                {appliedCoupon.code}
              </Badge>
              <span className="text-sm text-green-700">
                -$${appliedCoupon.discount.toFixed(2)} discount applied
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={removeCoupon}
              className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
              className="flex-1"
            />
            <Button 
              onClick={applyCoupon} 
              disabled={isLoading}
              className="whitespace-nowrap"
            >
              {isLoading ? 'Applying...' : 'Apply'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
