'use client'

import { useState, useEffect } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  Users
} from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
interface SellerStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  topProducts: Array<{
    id: string
    name: string
    sales: number
    revenue: number
  }>
  recentOrders: Array<{
    id: string
    customerName: string
    total: number
    status: string
    date: string
  }>
}

export default function SellerDashboard() {
  const [stats, setStats] = useState<SellerStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSellerStats()
  }, [])

  const fetchSellerStats = async () => {
    try {
      // In a real app, you'd fetch from your seller analytics API
      // For demo purposes, we'll use mock data
      const mockStats: SellerStats = {
        totalProducts: 156,
        totalOrders: 89,
        totalRevenue: 458750,
        averageOrderValue: 515.73,
        topProducts: [
          { id: '1', name: 'Premium T-Shirt', sales: 45, revenue: 58500 },
          { id: '2', name: 'Classic Jeans', sales: 38, revenue: 133620 },
          { id: '3', name: 'Smart Watch', sales: 32, revenue: 79968 },
          { id: '4', name: 'Running Shoes', sales: 28, revenue: 69972 },
          { id: '5', name: 'Casual Shirt', sales: 25, revenue: 37475 },
        ],
        recentOrders: [
          { id: '1', customerName: 'John Doe', total: 2599, status: 'delivered', date: '2026-03-01' },
          { id: '2', customerName: 'Jane Smith', total: 1299, status: 'shipped', date: '2026-03-02' },
          { id: '3', customerName: 'Bob Johnson', total: 3499, status: 'processing', date: '2026-03-03' },
          { id: '4', customerName: 'Alice Brown', total: 1899, status: 'delivered', date: '2026-02-28' },
          { id: '5', customerName: 'Charlie Wilson', total: 4299, status: 'processing', date: '2026-03-04' },
        ],
      }

      setStats(mockStats)
    } catch (error) {
      console.error('Error fetching seller stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Seller Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-gray-600">Loading Seller Dashboard...</h2>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.totalProducts}</div>
              <p className="text-sm text-gray-600">Products Listed</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.totalOrders}</div>
              <p className="text-sm text-gray-600">Orders Received</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-sm text-gray-600">Total Sales</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Avg Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{formatCurrency(stats.averageOrderValue)}</div>
              <p className="text-sm text-gray-600">Average Order</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Top Performing Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <div>
                      <div className="font-semibold">{product.name}</div>
                      <div className="text-sm text-gray-600">{product.sales} sold</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">{formatCurrency(product.revenue)}</div>
                    <div className="text-sm text-gray-600">Revenue</div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      {product.sales} units
                    </Badge>
                    <span className="text-sm text-gray-600 ml-2">× {formatCurrency(product.sales / product.sales * (product.revenue / product.sales))}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentOrders.map((order, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-semibold">Order #{index + 1}</div>
                    <div className="text-sm text-gray-600">{formatDateTime(new Date(order.date)).dateOnly}</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">{order.customerName}</div>
                    <div className="text-gray-600">{formatCurrency(order.total)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={order.status === 'delivered' ? 'default' :
                      order.status === 'shipped' ? 'secondary' :
                        order.status === 'processing' ? 'outline' : 'destructive'}
                    className="text-xs"
                  >
                    {order.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-4 border rounded-lg bg-gray-50">
              <div className="text-2xl font-bold text-primary">89%</div>
              <p className="text-sm text-gray-600">Order Completion Rate</p>
              <p className="text-xs text-gray-500">89 out of 100 orders completed successfully</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-primary">4.7</div>
              <p className="text-sm text-gray-600">Average Customer Rating</p>
              <p className="text-xs text-gray-500">Based on customer feedback</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-primary">24h</div>
              <p className="text-sm text-gray-600">Average Response Time</p>
              <p className="text-xs text-gray-500">Time from order to delivery</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
