'use client'

import { useState, useEffect } from 'react'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, DollarSign, Check, X, Clock } from 'lucide-react'
import { getCODOrders } from '@/lib/actions/cod.actions'

interface CODOrder {
  _id: string
  user: { name: string; email: string }
  items: any[]
  totalPrice: number
  shippingAddress: any
  createdAt: string
  codPayment?: {
    isPaid: boolean
    paidAt?: string
    paymentMethod: string
    amount: number
    collectedBy?: string
    notes?: string
  }
}

export default function CODManagementClient() {
  const [orders, setOrders] = useState<CODOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<CODOrder | null>(null)
  const [isMarkingPaid, setIsMarkingPaid] = useState(false)

  useEffect(() => {
    fetchCODOrders()
  }, [])

  const fetchCODOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/cod/orders')
      const data = await response.json()
      
      if (response.ok) {
        setOrders(data.orders || [])
      } else {
        toast({
          variant: 'destructive',
          description: data.error || 'Failed to load COD orders',
        })
      }
    } catch (error) {
      console.error('Fetch COD orders error:', error)
      toast({
        variant: 'destructive',
        description: 'Failed to load COD orders',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsPaid = async (payload: {
    orderId: string
    amount: number
    collectedBy: string
    notes?: string
  }) => {
    setIsMarkingPaid(true)
    try {
      const response = await fetch('/api/cod/mark-paid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (response.ok) {
        toast({ description: data.message })
        fetchCODOrders()
        setSelectedOrder(null)
      } else {
        toast({
          variant: 'destructive',
          description: data.error || 'Failed to mark COD as paid',
        })
      }
    } catch (error) {
      console.error('Mark COD as paid error:', error)
      toast({
        variant: 'destructive',
        description: 'Failed to mark COD as paid',
      })
    } finally {
      setIsMarkingPaid(false)
    }
  }

  const handleUpdateStatus = async (orderId: string, status: 'pending' | 'partial' | 'failed') => {
    try {
      const response = await fetch(`/api/cod/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          description: data.message,
        })
        fetchCODOrders() // Refresh the list
      } else {
        toast({
          variant: 'destructive',
          description: data.error || 'Failed to update COD status',
        })
      }
    } catch (error) {
      console.error('Update COD status error:', error)
      toast({
        variant: 'destructive',
        description: 'Failed to update COD status',
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">COD Management</h1>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            <DollarSign className="h-4 w-4" />
            Cash on Delivery Orders
          </Badge>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
          <p>Loading COD orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No COD Orders</h3>
            <p className="text-gray-600 mb-4">
              No Cash on Delivery orders found.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order._id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{order._id.slice(-6)}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {order.user.name} • {formatDate(order.createdAt)}
                    </p>
                    <p className="text-lg font-semibold">
                      ${order.totalPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge 
                      variant={order.codPayment?.isPaid ? "default" : "outline"}
                      className={
                        order.codPayment?.isPaid 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {order.codPayment?.isPaid ? (
                        <div className="flex items-center gap-1">
                          <Check className="h-4 w-4" />
                          Paid
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Pending
                        </div>
                      )}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Customer</h4>
                    <p className="text-sm text-gray-600">{order.user.name}</p>
                    <p className="text-sm text-gray-600">{order.user.email}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress?.fullName}<br />
                      {order.shippingAddress?.street}<br />
                      {order.shippingAddress?.city}, {order.shippingAddress?.province}<br />
                      {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">COD Payment Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge 
                        variant={order.codPayment?.isPaid ? "default" : "outline"}
                        className={
                          order.codPayment?.isPaid 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {order.codPayment?.isPaid ? "Paid" : "Pending"}
                      </Badge>
                    </div>
                    
                    {order.codPayment?.paidAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Paid Date:</span>
                        <span className="text-sm font-medium">
                          {formatDate(order.codPayment.paidAt)}
                        </span>
                      </div>
                    )}
                    
                    {order.codPayment?.amount && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Amount:</span>
                        <span className="text-sm font-medium">
                          ${order.codPayment.amount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    {order.codPayment?.collectedBy && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Collected By:</span>
                        <span className="text-sm font-medium">
                          {order.codPayment.collectedBy}
                        </span>
                      </div>
                    )}
                    
                    {order.codPayment?.notes && (
                      <div>
                        <span className="text-sm text-gray-600">Notes:</span>
                        <p className="text-sm font-medium mt-1">
                          {order.codPayment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  {!order.codPayment?.isPaid && (
                    <Button
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Mark as Paid
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Edit className="h-4 w-4" />
                    Update Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Mark as Paid Modal */}
      {selectedOrder && !selectedOrder.codPayment?.isPaid && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Mark Order #{selectedOrder._id.slice(-6)} as Paid
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </Button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleMarkAsPaid({
                  orderId: selectedOrder._id,
                  amount: selectedOrder.totalPrice,
                  collectedBy: 'Admin',
                  notes: 'Payment collected via cash on delivery',
                })
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount Collected ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue={selectedOrder.totalPrice.toFixed(2)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Collected By
                </label>
                <input
                  type="text"
                  defaultValue="Admin"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={3}
                  defaultValue="Payment collected via cash on delivery"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isMarkingPaid}
                  className="flex-1"
                >
                  {isMarkingPaid ? 'Marking as Paid...' : 'Mark as Paid'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                  disabled={isMarkingPaid}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
