'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { AlertTriangle, Package, TrendingUp, PackageX, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface InventoryItem {
  id: string
  name: string
  currentStock: number
  category: string
}

interface InventoryStats {
  totalProducts: number
  totalStock: number
  lowStockItems: InventoryItem[]
  outOfStockItems: InventoryItem[]
  categories: string[]
}

export default function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStock, setUpdatingStock] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [newStock, setNewStock] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory')
      const data = await response.json()
      
      if (data.success) {
        setInventory(data.data)
      } else {
        toast({
          description: 'Failed to load inventory',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStock = async () => {
    if (!selectedProduct || !newStock) {
      toast({
        description: 'Please select a product and enter new stock quantity',
        variant: 'destructive',
      })
      return
    }

    const stockValue = parseInt(newStock)
    if (isNaN(stockValue) || stockValue < 0) {
      toast({
        description: 'Please enter a valid positive number',
        variant: 'destructive',
      })
      return
    }

    setUpdatingStock(true)
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProduct,
          newStock: stockValue,
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          description: result.message,
          variant: 'default',
        })
        setSelectedProduct(null)
        setNewStock('')
        fetchInventory() // Refresh data
      } else {
        toast({
          description: result.error || 'Failed to update stock',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating stock:', error)
    } finally {
      setUpdatingStock(false)
    }
  }

  const getStockStatusColor = (stock: number) => {
    if (stock === 0) return 'text-red-600 bg-red-50'
    if (stock < 10) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  const getStockStatusIcon = (stock: number) => {
    if (stock === 0) return <PackageX className="h-5 w-5" />
    if (stock < 10) return <AlertTriangle className="h-5 w-5" />
    return <Package className="h-5 w-5" />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              Inventory Management
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

  if (!inventory) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-gray-600">Loading Inventory...</h2>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Inventory Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            Inventory Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{inventory.totalProducts}</div>
              <p className="text-sm text-gray-600">Total Products</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{inventory.totalStock}</div>
              <p className="text-sm text-gray-600">Total Stock</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{inventory.lowStockItems.length}</div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{inventory.outOfStockItems.length}</div>
              <p className="text-sm text-gray-600">Out of Stock</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{inventory.categories.length}</div>
              <p className="text-sm text-gray-600">Categories</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Management */}
      <Card>
        <CardHeader>
          <CardTitle>Update Stock Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="product-select">Select Product</Label>
                <select
                  id="product-select"
                  value={selectedProduct || ''}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Choose a product...</option>
                  {inventory.lowStockItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Current: {item.currentStock})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="new-stock">New Stock Quantity</Label>
                <Input
                  id="new-stock"
                  type="number"
                  placeholder="Enter new stock quantity"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <Button 
                  onClick={updateStock}
                  disabled={updatingStock || !selectedProduct || !newStock}
                  className="w-full"
                >
                  {updatingStock ? 'Updating...' : 'Update Stock'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {inventory.lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> The following products are running low on stock and need to be restocked soon:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inventory.lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600">{item.category}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        {item.currentStock} units
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Out of Stock Items */}
      {inventory.outOfStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageX className="h-6 w-6 text-red-600" />
              Out of Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-red-800">
                <strong>Critical:</strong> The following products are currently out of stock:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inventory.outOfStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600">{item.category}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">
                        Out of Stock
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
