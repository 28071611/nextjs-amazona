'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { createCoupon, updateCoupon, deleteCoupon, getCoupons } from '@/lib/actions/coupon.actions'
import { CouponInputSchema } from '@/lib/validator'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Gift, Edit, Trash2, Plus, Copy } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

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
  startDate: Date
  endDate: Date
  description?: string
  applicableProducts?: string[]
  applicableCategories?: string[]
}

export default function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<string | null>(null)
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(CouponInputSchema),
    defaultValues: {
      code: '',
      type: 'percentage',
      value: 0,
      minimumAmount: 0,
      maximumDiscount: undefined,
      usageLimit: 1,
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: '',
      applicableProducts: [],
      applicableCategories: [],
    },
  })

  useEffect(() => {
    loadCoupons()
  }, [])

  const loadCoupons = async () => {
    try {
      const data = await getCoupons()
      setCoupons(data)
    } catch (error) {
      toast({
        description: 'Failed to load coupons',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCoupon = async (data: any) => {
    setIsCreating(true)
    try {
      const result = await createCoupon(data)
      if (result.success) {
        toast({
          description: result.message,
          variant: 'default',
        })
        form.reset()
        loadCoupons()
      } else {
        toast({
          description: result.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        description: 'Failed to create coupon',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateCoupon = async (id: string, data: any) => {
    try {
      const result = await updateCoupon({ _id: id, ...data })
      if (result.success) {
        toast({
          description: result.message,
          variant: 'default',
        })
        setEditingCoupon(null)
        loadCoupons()
      } else {
        toast({
          description: result.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        description: 'Failed to update coupon',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) {
      return
    }

    try {
      const result = await deleteCoupon(id)
      if (result.success) {
        toast({
          description: result.message,
          variant: 'default',
        })
        loadCoupons()
      } else {
        toast({
          description: result.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        description: 'Failed to delete coupon',
        variant: 'destructive',
      })
    }
  }

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      description: 'Coupon code copied to clipboard',
      variant: 'default',
    })
  }

  const isCouponExpired = (endDate: string | Date) => {
    return new Date(endDate) < new Date()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create New Coupon */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Coupon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleCreateCoupon)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code</Label>
                <Input
                  id="code"
                  placeholder="e.g., SAVE20"
                  {...form.register('code')}
                  className="uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Discount Type</Label>
                <Select onValueChange={(value) => form.setValue('type', value)} defaultValue={form.watch('type')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Discount Value</Label>
                <Input
                  id="value"
                  type="number"
                  placeholder="10 or 10%"
                  {...form.register('value', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumAmount">Minimum Order Amount</Label>
                <Input
                  id="minimumAmount"
                  type="number"
                  placeholder="0"
                  {...form.register('minimumAmount', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usageLimit">Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  placeholder="1"
                  {...form.register('usageLimit', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maximumDiscount">Maximum Discount (₹)</Label>
                <Input
                  id="maximumDiscount"
                  type="number"
                  placeholder="Optional"
                  {...form.register('maximumDiscount', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Special discount for our valued customers"
                {...form.register('description')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...form.register('startDate')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...form.register('endDate')}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button type="submit" disabled={isCreating} className="flex-1">
                {isCreating ? 'Creating...' : 'Create Coupon'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Coupons List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Active Coupons ({coupons.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No coupons created yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {coupons.map((coupon) => (
                <div key={coupon._id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-lg font-bold">
                          {coupon.code}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCouponCode(coupon.code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="ml-2">
                          {coupon.type === 'percentage' ? `${coupon.value}% off` : `₹${coupon.value} off`}
                        </span>
                      </div>

                      {coupon.minimumAmount && (
                        <div className="text-sm">
                          Min order: ₹{coupon.minimumAmount}
                        </div>
                      )}

                      {coupon.usageLimit && (
                        <div className="text-sm">
                          Used: {coupon.usedCount}/{coupon.usageLimit}
                        </div>
                      )}
                    </div>

                    {coupon.description && (
                      <p className="text-sm text-gray-700 mt-2">{coupon.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right text-sm text-gray-500">
                      <div>Valid: {formatDateTime(new Date(coupon.startDate)).dateOnly}</div>
                      <div>to {formatDateTime(new Date(coupon.endDate)).dateOnly}</div>
                      {isCouponExpired(coupon.endDate) && (
                        <Badge variant="destructive">Expired</Badge>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingCoupon(coupon._id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCoupon(coupon._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
