'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useTransition } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { IOrder, OrderStatus } from '@/lib/db/models/order.model'
import { cn, formatDateTime } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import ProductPrice from '../product/product-price'
import ActionButton from '../action-button'
import { deliverOrder, updateOrderToPaid } from '@/lib/actions/order.actions'
import OrderTracking from './order-tracking'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { FileText, XCircle } from 'lucide-react'

const ORDER_STATUSES: OrderStatus[] = [
  'Placed',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
]

export default function OrderDetailsForm({
  order,
  isAdmin,
}: {
  order: IOrder
  isAdmin: boolean
}) {
  const {
    shippingAddress,
    items,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
    expectedDeliveryDate,
  } = order

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(
    (order.orderStatus as OrderStatus) || 'Placed'
  )
  const [statusNote, setStatusNote] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelForm, setShowCancelForm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const cancellableStatuses: OrderStatus[] = ['Placed', 'Packed']
  const currentStatus = (order.orderStatus as OrderStatus) || 'Placed'
  const canCancel =
    !order.isCancelled && cancellableStatuses.includes(currentStatus)

  const handleUpdateStatus = () => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/orders/${order._id}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: selectedStatus, note: statusNote }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        toast({ title: 'Order status updated', description: `Status set to ${selectedStatus}` })
        window.location.reload()
      } catch (err: unknown) {
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to update status',
          variant: 'destructive',
        })
      }
    })
  }

  const handleCancel = () => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/orders/${order._id}/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: cancelReason }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        toast({ title: 'Order cancelled' })
        window.location.reload()
      } catch (err: unknown) {
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to cancel',
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <div className='space-y-6'>
      {/* Order Tracking Timeline */}
      <Card>
        <CardContent className='p-6'>
          <h2 className='text-xl font-semibold mb-6'>Order Tracking</h2>
          <OrderTracking
            orderStatus={(order.orderStatus as OrderStatus) || 'Placed'}
            statusHistory={order.statusHistory?.map((h) => ({
              status: h.status as OrderStatus,
              updatedAt: h.updatedAt,
              note: h.note,
            }))}
            isCancelled={order.isCancelled}
            cancelledAt={order.cancelledAt}
            cancelReason={order.cancelReason}
          />
        </CardContent>
      </Card>

      <div className='grid md:grid-cols-3 md:gap-5'>
        <div className='overflow-x-auto md:col-span-2 space-y-4'>
          <Card>
            <CardContent className='p-4 gap-4'>
              <h2 className='text-xl pb-4'>Shipping Address</h2>
              <p>
                {shippingAddress.fullName} {shippingAddress.phone}
              </p>
              <p>
                {shippingAddress.street}, {shippingAddress.city},{' '}
                {shippingAddress.province}, {shippingAddress.postalCode},{' '}
                {shippingAddress.country}{' '}
              </p>

              {isDelivered ? (
                <Badge>Delivered at {formatDateTime(deliveredAt!).dateTime}</Badge>
              ) : (
                <div>
                  {' '}
                  <Badge variant='destructive'>Not delivered</Badge>
                  <div>
                    Expected delivery at{' '}
                    {formatDateTime(expectedDeliveryDate!).dateTime}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4 gap-4'>
              <h2 className='text-xl pb-4'>Payment Method</h2>
              <p>{paymentMethod}</p>
              {isPaid ? (
                <Badge>Paid at {formatDateTime(paidAt!).dateTime}</Badge>
              ) : (
                <Badge variant='destructive'>Not paid</Badge>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4 gap-4'>
              <h2 className='text-xl pb-4'>Order Items</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.slug}>
                      <TableCell>
                        <Link
                          href={`/product/${item.slug}`}
                          className='flex items-center'
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={50}
                            height={50}
                          ></Image>
                          <span className='px-2'>{item.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className='px-2'>{item.quantity}</span>
                      </TableCell>
                      <TableCell className='text-right'>${item.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className='space-y-4'>
          <Card>
            <CardContent className='p-4 space-y-4 gap-4'>
              <h2 className='text-xl pb-4'>Order Summary</h2>
              <div className='flex justify-between'>
                <div>Items</div>
                <div>
                  {' '}
                  <ProductPrice price={itemsPrice} plain />
                </div>
              </div>
              <div className='flex justify-between'>
                <div>Tax</div>
                <div>
                  {' '}
                  <ProductPrice price={taxPrice} plain />
                </div>
              </div>
              <div className='flex justify-between'>
                <div>Shipping</div>
                <div>
                  {' '}
                  <ProductPrice price={shippingPrice} plain />
                </div>
              </div>
              <div className='flex justify-between'>
                <div>Total</div>
                <div>
                  {' '}
                  <ProductPrice price={totalPrice} plain />
                </div>
              </div>

              {!isPaid && ['Stripe', 'PayPal'].includes(paymentMethod) && (
                <Link
                  className={cn(buttonVariants(), 'w-full')}
                  href={`/checkout/${order._id}`}
                >
                  Pay Order
                </Link>
              )}

              {isAdmin && !isPaid && paymentMethod === 'Cash On Delivery' && (
                <ActionButton
                  caption='Mark as paid'
                  action={() => updateOrderToPaid(order._id)}
                />
              )}
              {isAdmin && isPaid && !isDelivered && (
                <ActionButton
                  caption='Mark as delivered'
                  action={() => deliverOrder(order._id)}
                />
              )}

              {/* Invoice Button */}
              <a
                href={`/api/orders/${order._id}/invoice`}
                target='_blank'
                rel='noopener noreferrer'
                className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
              >
                <FileText className='h-4 w-4 mr-2' />
                View / Print Invoice
              </a>

              {/* Cancel Order Button */}
              {canCancel && !showCancelForm && (
                <Button
                  variant='destructive'
                  className='w-full'
                  onClick={() => setShowCancelForm(true)}
                >
                  <XCircle className='h-4 w-4 mr-2' />
                  Cancel Order
                </Button>
              )}
              {canCancel && showCancelForm && (
                <div className='space-y-2'>
                  <Input
                    placeholder='Reason for cancellation (optional)'
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  <div className='flex gap-2'>
                    <Button
                      variant='destructive'
                      className='flex-1'
                      onClick={handleCancel}
                      disabled={isPending}
                    >
                      Confirm Cancel
                    </Button>
                    <Button
                      variant='outline'
                      className='flex-1'
                      onClick={() => setShowCancelForm(false)}
                    >
                      Back
                    </Button>
                  </div>
                </div>
              )}

              {/* Return Request (for delivered orders) */}
              {isDelivered && !order.isCancelled && (
                <Link
                  href={`/api/refunds`}
                  className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
                  onClick={(e) => {
                    e.preventDefault()
                    toast({
                      title: 'Return Request',
                      description:
                        'Please contact support with your order ID to process a return.',
                    })
                  }}
                >
                  Request Return / Refund
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Admin: Update Order Status */}
          {isAdmin && !order.isCancelled && (
            <Card>
              <CardContent className='p-4 space-y-3'>
                <h2 className='text-lg font-semibold'>Update Order Status</h2>
                <Select
                  value={selectedStatus}
                  onValueChange={(v) => setSelectedStatus(v as OrderStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder='Optional note (e.g. tracking number)'
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
                <Button
                  className='w-full'
                  onClick={handleUpdateStatus}
                  disabled={isPending || selectedStatus === currentStatus}
                >
                  {isPending ? 'Updating...' : 'Update Status & Notify Customer'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
