'use client'

import { useEffect, useState } from 'react'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Copy } from 'lucide-react'
import { ICoupon } from '@/lib/db/models/coupon.model'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'

export default function CouponList() {
  const [coupons, setCoupons] = useState<ICoupon[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/coupons')
      const data = await response.json()
      
      if (response.ok) {
        setCoupons(data)
      } else {
        toast({
          variant: 'destructive',
          description: data.error || 'Failed to load coupons',
        })
      }
    } catch (error) {
      console.error('Fetch coupons error:', error)
      toast({
        variant: 'destructive',
        description: 'Failed to load coupons',
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) {
      return
    }

    try {
      const response = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          description: data.message,
        })
        fetchCoupons()
      } else {
        toast({
          variant: 'destructive',
          description: data.error || 'Failed to delete coupon',
        })
      }
    } catch (error) {
      console.error('Delete coupon error:', error)
      toast({
        variant: 'destructive',
        description: 'Failed to delete coupon',
      })
    }
  }

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      description: 'Coupon code copied to clipboard',
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading coupons...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Coupons</h1>
          <p className="text-gray-600">Manage discount coupons and promotions</p>
        </div>
        <Link href="/admin/coupons/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Coupon
          </Button>
        </Link>
      </div>

      {coupons.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons found</h3>
            <p className="text-gray-600 mb-4">Create your first coupon to get started.</p>
            <Link href="/admin/coupons/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Coupon
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {coupons.map((coupon) => (
            <Card key={coupon._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{coupon.code}</CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyCouponCode(coupon.code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        {coupon.type === 'percentage' 
                          ? `${coupon.value}% off` 
                          : `$${coupon.value} off`
                        }
                      </span>
                      {coupon.minimumAmount && (
                        <span>Min: ${coupon.minimumAmount}</span>
                      )}
                      {coupon.usageLimit && (
                        <span>Used: {coupon.usedCount}/{coupon.usageLimit}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/coupons/${coupon._id}/edit`}>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteCoupon(coupon._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  <p>Valid from: {formatDateTime(coupon.startDate).dateOnly}</p>
                  <p>Valid until: {formatDateTime(coupon.endDate).dateOnly}</p>
                  {coupon.applicableCategories && coupon.applicableCategories.length > 0 && (
                    <p>Categories: {coupon.applicableCategories.join(', ')}</p>
                  )}
                  {coupon.applicableProducts && coupon.applicableProducts.length > 0 && (
                    <p>Products: {coupon.applicableProducts.length} selected</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
