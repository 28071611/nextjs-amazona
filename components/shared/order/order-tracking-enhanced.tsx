'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, Package, Truck, MapPin } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface TrackingStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  timestamp?: string
  location?: string
}

interface OrderTrackingProps {
  orderId: string
  currentStatus?: string
  estimatedDelivery?: string
}

const OrderTracking = ({ orderId, currentStatus = 'processing', estimatedDelivery }: OrderTrackingProps) => {
  const [trackingSteps, setTrackingSteps] = useState<TrackingStep[]>([
    {
      id: '1',
      title: 'Order Placed',
      description: 'Your order has been received and is being processed',
      status: 'completed',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Order Confirmed',
      description: 'Your order has been confirmed and payment verified',
      status: currentStatus === 'confirmed' ? 'completed' : 'pending',
    },
    {
      id: '3',
      title: 'Processing',
      description: 'Your order is being prepared for shipment',
      status: currentStatus === 'processing' ? 'in-progress' : 'pending',
    },
    {
      id: '4',
      title: 'Packed',
      description: 'Your items have been packed and ready for shipment',
      status: currentStatus === 'packed' ? 'completed' : 'pending',
    },
    {
      id: '5',
      title: 'Shipped',
      description: 'Your order has been shipped and is on its way',
      status: currentStatus === 'shipped' ? 'in-progress' : 'pending',
      location: 'Mumbai, Maharashtra',
    },
    {
      id: '6',
      title: 'Out for Delivery',
      description: 'Your order is with the delivery partner and will be delivered today',
      status: currentStatus === 'out-for-delivery' ? 'in-progress' : 'pending',
      location: 'Local Delivery Hub',
    },
    {
      id: '7',
      title: 'Delivered',
      description: 'Your order has been successfully delivered',
      status: currentStatus === 'delivered' ? 'completed' : 'pending',
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'in-progress':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5" />
      case 'in-progress':
        return <Clock className="h-5 w-5 animate-pulse" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Order Header */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Order Tracking</CardTitle>
            <Badge variant="outline" className="text-sm">
              Order #{orderId.slice(-6)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Delivery Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <span className="text-sm">Estimated Delivery:</span>
                </div>
                <p className="font-medium text-primary">
                  {estimatedDelivery ? formatDateTime(new Date(estimatedDelivery)).dateOnly : 'Calculating...'}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Current Status</h3>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentStatus)}`}>
                  {currentStatus.replace('-', ' ').toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Tracking Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Vertical Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            <div className="space-y-8">
              {trackingSteps.map((step, index) => (
                <div key={step.id} className="relative flex items-start gap-4">
                  {/* Timeline Node */}
                  <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${getStatusColor(step.status)}`}>
                    {getStatusIcon(step.status)}
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className={`p-4 rounded-lg border-2 ${getStatusColor(step.status)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{step.title}</h4>
                        {step.timestamp && (
                          <span className="text-xs text-gray-500">
                            {formatDateTime(new Date(step.timestamp)).dateTime}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{step.description}</p>
                      {step.location && (
                        <div className="flex items-center gap-1 mt-2">
                          <MapPin className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">{step.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button variant="outline" className="flex-1">
          <Package className="h-4 w-4 mr-2" />
          Track Package
        </Button>
        <Button className="flex-1">
          <Truck className="h-4 w-4 mr-2" />
          Contact Support
        </Button>
      </div>
    </div>
  )
}

export default OrderTracking
