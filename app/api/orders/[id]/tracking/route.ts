import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params
    await connectToDatabase()

    const order = await Order.findOne({ _id: id })
      .populate('user', 'name email')
      .populate('items.product', 'name image')

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if user owns this order
    if ((order.user as any)._id?.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Calculate estimated delivery date based on shipping method
    const estimatedDelivery = new Date(order.createdAt)
    estimatedDelivery.setDate(estimatedDelivery.getDate() + ((order as any).deliveryDate?.daysToDeliver || 5))

    return NextResponse.json({
      success: true,
      order: {
        id: order._id,
        orderId: order._id.toString().slice(-6),
        status: order.orderStatus,
        createdAt: order.createdAt,
        estimatedDelivery: estimatedDelivery.toISOString(),
        items: order.items.map((item: any) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
          image: item.product.image,
        })),
        totalPrice: order.totalPrice,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        trackingHistory: [
          {
            status: 'Processing',
            timestamp: order.createdAt,
            description: 'Order placed and payment confirmed',
            location: null,
          },
          ...(order.orderStatus !== 'Processing' ? [{
            status: order.orderStatus,
            timestamp: order.updatedAt,
            description: getOrderStatusDescription(order.orderStatus),
            location: order.orderStatus === 'Shipped' ? 'Distribution Center' : null,
          }] : [])
        ],
      },
    })
  } catch (error) {
    console.error('Order tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order tracking' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const order = await Order.findOne({ _id: id })
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if user owns this order or is admin
    if (order.user.toString() !== session.user.id && session.user.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Update order status
    const validStatuses = ['Processing', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    order.orderStatus = status
    order.updatedAt = new Date()
    await order.save()

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: {
        id: order._id,
        status: order.orderStatus,
        updatedAt: order.updatedAt,
      },
    })
  } catch (error) {
    console.error('Order status update error:', error)
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
}

function getOrderStatusDescription(status: string): string {
  const descriptions: Record<string, string> = {
    Processing: 'Order is being processed',
    Confirmed: 'Order confirmed and payment verified',
    Packed: 'Items packed and ready for shipment',
    Shipped: 'Order shipped from distribution center',
    'Out for Delivery': 'Order out for delivery',
    Delivered: 'Order successfully delivered',
    Cancelled: 'Order cancelled',
  }
  return descriptions[status] || 'Status updated'
}
