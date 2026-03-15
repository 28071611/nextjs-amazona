import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, AlertTriangle, CheckCircle, Eye } from 'lucide-react'
import Link from 'next/link'

// Mock data - in a real implementation, this would come from your database
const mockOrders = [
  {
    _id: '1',
    user: { name: 'John Doe', email: 'john@example.com' },
    totalPrice: 1299.99,
    items: [
      { name: 'Premium Laptop', price: 999.99, quantity: 1 },
      { name: 'Wireless Mouse', price: 29.99, quantity: 2 },
    ],
    createdAt: new Date('2024-01-15'),
    fraudAnalysis: {
      isFraudulent: true,
      riskScore: 0.85,
      reason: 'High order value with multiple expensive items and new customer account',
    },
  },
  {
    _id: '2',
    user: { name: 'Jane Smith', email: 'jane@example.com' },
    totalPrice: 89.99,
    items: [
      { name: 'USB Cable', price: 19.99, quantity: 1 },
      { name: 'Phone Case', price: 29.99, quantity: 1 },
    ],
    createdAt: new Date('2024-01-14'),
    fraudAnalysis: {
      isFraudulent: false,
      riskScore: 0.15,
      reason: 'Regular order pattern with returning customer',
    },
  },
  {
    _id: '3',
    user: { name: 'Mike Johnson', email: 'mike@example.com' },
    totalPrice: 2499.99,
    items: [
      { name: 'Gaming Console', price: 499.99, quantity: 1 },
      { name: '4K Monitor', price: 899.99, quantity: 1 },
      { name: 'Gaming Chair', price: 399.99, quantity: 1 },
    ],
    createdAt: new Date('2024-01-13'),
    fraudAnalysis: {
      isFraudulent: true,
      riskScore: 0.72,
      reason: 'Multiple high-value items in single order',
    },
  },
]

export default async function FraudDetectionPage() {

  const highRiskOrders = mockOrders.filter(order => order.fraudAnalysis.isFraudulent)
  const lowRiskOrders = mockOrders.filter(order => !order.fraudAnalysis.isFraudulent)

  const getRiskBadgeColor = (riskScore: number) => {
    if (riskScore >= 0.8) return 'destructive'
    if (riskScore >= 0.6) return 'secondary'
    return 'outline'
  }

  const getRiskText = (riskScore: number) => {
    if (riskScore >= 0.8) return 'High Risk'
    if (riskScore >= 0.6) return 'Medium Risk'
    return 'Low Risk'
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center gap-2'>
        <Shield className='h-6 w-6' />
        <h1 className='h1-bold'>AI Fraud Detection</h1>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>Total Orders Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{mockOrders.length}</div>
            <p className='text-xs text-muted-foreground'>Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-red-600'>Suspicious Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>{highRiskOrders.length}</div>
            <p className='text-xs text-muted-foreground'>Require manual review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-green-600'>Legitimate Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>{lowRiskOrders.length}</div>
            <p className='text-xs text-muted-foreground'>Approved automatically</p>
          </CardContent>
        </Card>
      </div>

      {/* High Risk Orders */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-red-600'>
            <AlertTriangle className='h-5 w-5' />
            High Risk Orders (Manual Review Required)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {highRiskOrders.length === 0 ? (
            <p className='text-muted-foreground'>No high risk orders found.</p>
          ) : (
            <div className='space-y-4'>
              {highRiskOrders.map((order) => (
                <div key={order._id} className='border rounded-lg p-4 space-y-3'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>{order.user.name}</p>
                      <p className='text-sm text-muted-foreground'>{order.user.email}</p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge variant={getRiskBadgeColor(order.fraudAnalysis.riskScore)}>
                        {getRiskText(order.fraudAnalysis.riskScore)}
                      </Badge>
                      <Badge variant='outline'>
                        Score: {Math.round(order.fraudAnalysis.riskScore * 100)}%
                      </Badge>
                    </div>
                  </div>

                  <div className='text-sm'>
                    <p className='font-medium'>Order Total: ${order.totalPrice.toFixed(2)}</p>
                    <p className='text-muted-foreground'>
                      {order.items.length} items • {order.createdAt.toLocaleDateString()}
                    </p>
                  </div>

                  <div className='bg-red-50 border border-red-200 rounded p-3'>
                    <p className='text-sm font-medium text-red-800'>AI Analysis:</p>
                    <p className='text-sm text-red-700'>{order.fraudAnalysis.reason}</p>
                  </div>

                  <div className='flex gap-2'>
                    <Link href={`/admin/orders/${order._id}`}>
                      <Button size='sm' variant='outline'>
                        <Eye className='h-4 w-4 mr-1' />
                        Review Order
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders with Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <CheckCircle className='h-5 w-5' />
            Recent Orders with Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {mockOrders.map((order) => (
              <div key={order._id} className='border rounded-lg p-4 space-y-3'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='font-medium'>{order.user.name}</p>
                    <p className='text-sm text-muted-foreground'>{order.user.email}</p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge variant={getRiskBadgeColor(order.fraudAnalysis.riskScore)}>
                      {getRiskText(order.fraudAnalysis.riskScore)}
                    </Badge>
                    <Badge variant='outline'>
                      Score: {Math.round(order.fraudAnalysis.riskScore * 100)}%
                    </Badge>
                  </div>
                </div>

                <div className='text-sm'>
                  <p className='font-medium'>Order Total: ${order.totalPrice.toFixed(2)}</p>
                  <p className='text-muted-foreground'>
                    {order.items.length} items • {order.createdAt.toLocaleDateString()}
                  </p>
                </div>

                <div className='bg-gray-50 border rounded p-3'>
                  <p className='text-sm font-medium'>AI Assessment:</p>
                  <p className='text-sm text-muted-foreground'>{order.fraudAnalysis.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
