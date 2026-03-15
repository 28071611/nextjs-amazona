'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { applyCoupon } from '@/lib/actions/coupon.actions'
import { validateCoupon } from '@/lib/actions/coupon.actions'
import { Gift, Tag, Calendar, Percent } from 'lucide-react'

interface Coupon {
  _id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minimumAmount?: number
  maximumDiscount?: number
  usageLimit?: number
  usedCount: number
  isActive: boolean
  startDate: string
  endDate: string
  description?: string
  applicableProducts?: string[]
  applicableCategories?: string[]
}

interface CouponDisplayProps {
  coupon?: Coupon
  onApply: (code: string) => void
  onRemove: () => void
  orderAmount: number
}

export default function CouponDisplay({ coupon, onApply, onRemove, orderAmount }: CouponDisplayProps) {
  const [couponCode, setCouponCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const { toast } = useToast()

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        description: 'Please enter a coupon code',
        variant: 'destructive',
      })
      return
    }

    setIsValidating(true)
    try {
      const result = await applyCoupon(couponCode.trim(), orderAmount)
      
      if (result.success) {
        toast({
          description: result.message,
          variant: 'default',
        })
        onApply(couponCode.trim())
        setCouponCode('')
      } else {
        toast({
          description: result.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        description: 'Failed to apply coupon',
        variant: 'destructive',
      })
    } finally {
      setIsValidating(false)
    }
  }

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.type === 'percentage') {
      return `${coupon.value}% off`
    } else {
      return `₹${coupon.value} off`
    }
  }

  const isCouponValid = (coupon: Coupon) => {
    const now = new Date()
    const startDate = new Date(coupon.startDate)
    const endDate = new Date(coupon.endDate)
    
    return coupon.isActive && now >= startDate && now <= endDate
  }

  if (!coupon) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Have a Coupon Code?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="flex-1"
            />
            <Button 
              onClick={handleApplyCoupon}
              disabled={isValidating || !couponCode.trim()}
              className="min-w-24"
            >
              {isValidating ? 'Applying...' : 'Apply'}
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>Enter a coupon code to apply discount to your order.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-green-600" />
            Coupon Applied
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onRemove}>
            Remove
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
          <div>
            <div className="font-bold text-lg text-green-800">{coupon.code}</div>
            <div className="text-sm text-green-600">{formatDiscount(coupon)}</div>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              You saved ₹{((orderAmount * (coupon.type === 'percentage' ? coupon.value / 100 : coupon.value)).toFixed(2))}
            </Badge>
          </div>
        </div>

        {coupon.description && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">{coupon.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Valid until:</span>
          </div>
          <div className="font-medium">
            {new Date(coupon.endDate).toLocaleDateString()}
          </div>
        </div>

        {coupon.minimumAmount && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Minimum order:</span>
            <span className="font-medium">₹{coupon.minimumAmount}</span>
          </div>
        )}

        {coupon.usageLimit && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Usage limit:</span>
            <span className="font-medium">{coupon.usedCount}/{coupon.usageLimit}</span>
          </div>
        )}

        {coupon.applicableCategories && coupon.applicableCategories.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-500">Applies to:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {coupon.applicableCategories.map((category, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
