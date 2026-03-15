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
      .populate('shippingAddress')

    if (!order) {
      return NextResponse.json(
        { error: 'Invoice not found' },
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

    // Generate invoice data
    const invoiceData = {
      invoiceNumber: `INV-${order._id.toString().slice(-6).toUpperCase()}`,
      orderDate: order.createdAt,
      dueDate: order.createdAt,
      customer: {
        name: (order.user as any).name,
        email: (order.user as any).email,
        address: order.shippingAddress,
      },
      items: order.items.map((item: any) => ({
        name: item.product.name,
        description: item.product.description || 'Product description',
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.price * item.quantity,
        image: item.product.image,
        sku: item.product._id.toString(),
      })),
      subtotal: order.itemsPrice,
      shipping: order.shippingPrice,
      tax: order.taxPrice,
      total: order.totalPrice,
      paymentMethod: order.paymentMethod,
      status: order.orderStatus,
    }

    return NextResponse.json({
      success: true,
      invoice: invoiceData,
    })
  } catch (error) {
    console.error('Invoice generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    )
  }
}

export async function POST(
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
    const { action } = body

    await connectToDatabase()

    const order = await Order.findOne({ _id: id })
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if user owns this order
    if ((order.user as any)._id?.toString() !== session.user.id && session.user.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    let message = ''

    switch (action) {
      case 'send-email':
        // In a real app, you'd integrate with your email service
        // For demo, we'll just log the action
        console.log(`Email invoice INV-${id} to ${(order.user as any).email}`)
        message = 'Invoice sent successfully'
        break

      case 'mark-paid':
        order.isPaid = true
        order.paidAt = new Date()
        await order.save()
        message = 'Order marked as paid'
        break

      default:
        message = 'Invalid action'
    }

    return NextResponse.json({
      success: true,
      message,
    })
  } catch (error) {
    console.error('Invoice action error:', error)
    return NextResponse.json(
      { error: 'Failed to process invoice action' },
      { status: 500 }
    )
  }
}
