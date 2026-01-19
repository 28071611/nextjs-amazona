'use client'

import { useState, useEffect } from 'react'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, X, Clock, DollarSign, Eye, AlertTriangle } from 'lucide-react'
import { getAllRefunds, updateRefundStatus } from '@/lib/actions/refund.actions'

interface Refund {
  refundId: string
  orderId: string
  orderNumber: string
  customerName: string
  customerEmail: string
  orderTotal: number
  orderDate: string
  amount: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'processed'
  processedAt?: string
  processedBy?: string
  notes?: string
}

export default function RefundManagementClient() {
  const [refunds, setRefunds] = useState<Refund[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchRefunds()
  }, [])

  const fetchRefunds = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/refunds')
      const data = await response.json()
      
      if (response.ok) {
        setRefunds(data.refunds || [])
      } else {
        toast({
          variant: 'destructive',
          description: data.error || 'Failed to load refunds',
        })
      }
    } catch (error) {
      console.error('Fetch refunds error:', error)
      toast({
        variant: 'destructive',
        description: 'Failed to load refunds',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (refundId: string, status: 'approved' | 'rejected' | 'processed', notes?: string) => {
    setIsUpdating(true)
    
    try {
      const response = await fetch(`/api/refunds/${refundId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          description: data.message,
        })
        fetchRefunds() // Refresh the list
        setSelectedRefund(null)
      } else {
        toast({
          variant: 'destructive',
          description: data.error || 'Failed to update refund status',
        })
      }
    } catch (error) {
      console.error('Update refund status error:', error)
      toast({
        variant: 'destructive',
        description: 'Failed to update refund status',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'processed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'approved':
        return <Check className="h-4 w-4" />
      case 'rejected':
        return <AlertTriangle className="h-4 w-4" />
      case 'processed':
        return <DollarSign className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Refund Management</h1>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            <DollarSign className="h-4 w-4" />
            Refunds & Returns
          </Badge>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
          <p>Loading refunds...</p>
        </div>
      ) : refunds.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Refunds Found</h3>
            <p className="text-gray-600 mb-4">
              No refund requests have been submitted yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {refunds.map((refund) => (
            <Card key={refund.refundId} className="relative">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Refund #{refund.refundId}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Order #{refund.orderNumber} • {formatDate(refund.orderDate)}
                    </p>
                    <p className="text-lg font-semibold">
                      ${refund.amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge 
                      variant="outline"
                      className={getStatusColor(refund.status)}
                    >
                      {getStatusIcon(refund.status)}
                      <span className="ml-2">{refund.status}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Customer</h4>
                    <p className="text-sm text-gray-600">{refund.customerName}</p>
                    <p className="text-sm text-gray-600">{refund.customerEmail}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                    <p className="text-sm text-gray-600">
                      Order #{refund.orderNumber}<br />
                      Total: ${refund.orderTotal.toFixed(2)}<br />
                      Date: {formatDate(refund.orderDate)}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Refund Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Reason:</span>
                      <span className="text-sm font-medium">{refund.reason}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge 
                        variant="outline"
                        className={getStatusColor(refund.status)}
                      >
                        {getStatusIcon(refund.status)}
                        <span className="ml-2">{refund.status}</span>
                      </Badge>
                    </div>
                    
                    {refund.processedAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Processed Date:</span>
                        <span className="text-sm font-medium">
                          {formatDate(refund.processedAt)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Processed By:</span>
                      <span className="text-sm font-medium">
                        {refund.processedBy || 'N/A'}
                      </span>
                    </div>
                    
                    {refund.notes && (
                      <div>
                        <span className="text-sm text-gray-600">Notes:</span>
                        <p className="text-sm font-medium mt-1">
                          {refund.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  {refund.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => setSelectedRefund(refund)}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                  )}
                  
                  {refund.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedRefund(refund)}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Reject
                    </Button>
                  )}
                  
                  {(refund.status === 'approved' || refund.status === 'rejected') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedRefund(refund)}
                    >
                      <Eye className="h-4 w-4" />
                      Update Status
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Update Status Modal */}
      {selectedRefund && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Update Refund Status
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRefund(null)}
              >
                ×
              </Button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              handleUpdateStatus(selectedRefund.refundId, 'approved', 'Refund approved and processed')
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Status
                </label>
                <select
                  defaultValue={selectedRefund.status}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="processed">Processed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Add any notes about this refund..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1"
                >
                  {isUpdating ? 'Updating...' : 'Update Status'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedRefund(null)}
                  disabled={isUpdating}
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
