'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Sparkles, TrendingDown, Package, Percent } from 'lucide-react'
import { IProduct } from '@/lib/db/models/product.model'

interface DiscountSuggestion {
  productId: string
  productName: string
  currentPrice: number
  stock: number
  discountPercentage: number
  newPrice: number
  reason: string
}

export default function DynamicDiscountPage() {
  const [suggestions, setSuggestions] = useState<DiscountSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [applyingDiscount, setApplyingDiscount] = useState<string | null>(null)

  useEffect(() => {
    fetchDiscountSuggestions()
  }, [])

  const fetchDiscountSuggestions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/dynamic-discount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        const processedSuggestions = data.discounts.map((discount: any) => ({
          productId: discount.productId,
          productName: `Product ${discount.productId}`, // In real app, fetch product details
          currentPrice: 100, // Mock price - in real app, fetch from product
          stock: 50, // Mock stock - in real app, fetch from product
          discountPercentage: discount.discountPercentage,
          newPrice: 100 * (1 - discount.discountPercentage / 100),
          reason: discount.reason,
        }))
        setSuggestions(processedSuggestions)
      }
    } catch (error) {
      console.error('Error fetching discount suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyDiscount = async (productId: string, discountPercentage: number) => {
    setApplyingDiscount(productId)
    try {
      // In a real implementation, this would call your product update API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      setSuggestions(prev => prev.filter(s => s.productId !== productId))
    } catch (error) {
      console.error('Error applying discount:', error)
    } finally {
      setApplyingDiscount(null)
    }
  }

  const getDiscountLevel = (percentage: number) => {
    if (percentage >= 30) return { label: 'High', color: 'destructive' }
    if (percentage >= 15) return { label: 'Medium', color: 'secondary' }
    return { label: 'Low', color: 'outline' }
  }

  const totalSavings = suggestions.reduce((sum, s) => sum + (s.currentPrice - s.newPrice), 0)
  const avgDiscount = suggestions.length > 0 
    ? suggestions.reduce((sum, s) => sum + s.discountPercentage, 0) / suggestions.length 
    : 0

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center gap-2'>
        <Sparkles className='h-6 w-6' />
        <h1 className='h1-bold'>AI Dynamic Discount System</h1>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>Products Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{suggestions.length}</div>
            <p className='text-xs text-muted-foreground'>Need discounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>Average Discount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{avgDiscount.toFixed(1)}%</div>
            <p className='text-xs text-muted-foreground'>Recommended</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-green-600'>Total Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>${totalSavings.toFixed(2)}</div>
            <p className='text-xs text-muted-foreground'>For customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>Conversion Boost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>+{Math.round(avgDiscount * 2)}%</div>
            <p className='text-xs text-muted-foreground'>Estimated</p>
          </CardContent>
        </Card>
      </div>

      {/* Discount Suggestions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className='flex items-center gap-2'>
              <TrendingDown className='h-5 w-5' />
              AI-Recommended Discounts
            </CardTitle>
            <Button onClick={fetchDiscountSuggestions} disabled={loading}>
              {loading ? 'Analyzing...' : 'Refresh Suggestions'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No discount recommendations at this time.</p>
              <p className="text-sm text-muted-foreground">All products are optimally priced!</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {suggestions.map((suggestion) => {
                const level = getDiscountLevel(suggestion.discountPercentage)
                return (
                  <div key={suggestion.productId} className='border rounded-lg p-4 space-y-3'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='font-medium'>{suggestion.productName}</h3>
                        <p className='text-sm text-muted-foreground'>
                          Stock: {suggestion.stock} units
                        </p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge variant={level.color as any}>
                          {level.label} Discount
                        </Badge>
                        <Badge variant='outline'>
                          <Percent className='h-3 w-3 mr-1' />
                          {suggestion.discountPercentage}%
                        </Badge>
                      </div>
                    </div>

                    <div className='flex items-center gap-4'>
                      <div className='text-sm'>
                        <span className='line-through text-gray-500'>
                          ${suggestion.currentPrice.toFixed(2)}
                        </span>
                        <span className='ml-2 font-bold text-green-600'>
                          ${suggestion.newPrice.toFixed(2)}
                        </span>
                      </div>
                      <Progress value={suggestion.discountPercentage} className="flex-1" />
                    </div>

                    <div className='bg-blue-50 border border-blue-200 rounded p-3'>
                      <p className='text-sm font-medium text-blue-800'>AI Reasoning:</p>
                      <p className='text-sm text-blue-700'>{suggestion.reason}</p>
                    </div>

                    <div className='flex gap-2'>
                      <Button
                        size='sm'
                        onClick={() => applyDiscount(suggestion.productId, suggestion.discountPercentage)}
                        disabled={applyingDiscount === suggestion.productId}
                      >
                        {applyingDiscount === suggestion.productId ? 'Applying...' : 'Apply Discount'}
                      </Button>
                      <Button size='sm' variant='outline'>
                        Adjust Discount
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Discount Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>High Discounts (30%+)</span>
                <span className="font-medium">
                  {suggestions.filter(s => s.discountPercentage >= 30).length} products
                </span>
              </div>
              <div className="flex justify-between">
                <span>Medium Discounts (15-29%)</span>
                <span className="font-medium">
                  {suggestions.filter(s => s.discountPercentage >= 15 && s.discountPercentage < 30).length} products
                </span>
              </div>
              <div className="flex justify-between">
                <span>Low Discounts (1-14%)</span>
                <span className="font-medium">
                  {suggestions.filter(s => s.discountPercentage > 0 && s.discountPercentage < 15).length} products
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impact Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Sales Increase</span>
                  <span className="text-sm font-medium">+{Math.round(avgDiscount * 1.5)}%</span>
                </div>
                <Progress value={Math.min(avgDiscount * 1.5, 100)} />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Inventory Clearance</span>
                  <span className="text-sm font-medium">+{Math.round(avgDiscount * 2)}%</span>
                </div>
                <Progress value={Math.min(avgDiscount * 2, 100)} />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Customer Satisfaction</span>
                  <span className="text-sm font-medium">+{Math.round(avgDiscount)}%</span>
                </div>
                <Progress value={Math.min(avgDiscount, 100)} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
