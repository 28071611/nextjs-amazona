import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { razorpayService } from '@/lib/razorpay'
import { createOrder } from '@/lib/actions/order.actions'
import { connectToDatabase } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      paymentId,
      orderId,
      amount,
      items,
      shippingAddress,
      expectedDeliveryDate,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice
    } = body

    if (!paymentId || !orderId || !amount || !items || !shippingAddress) {
      return NextResponse.json(
        { error: 'Payment ID, order ID, and amount are required' },
        { status: 400 }
      )
    }

    // Verify Razorpay signature
    const razorpayOrderResponse = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')}`,
      },
    })

    if (!razorpayOrderResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to verify payment order' },
        { status: 500 }
      )
    }

    const razorpayOrder = await razorpayOrderResponse.json()
    const receivedSignature = request.headers.get('x-razorpay-signature')

    if (!razorpayService.verifyPaymentSignature(orderId, paymentId, receivedSignature || '')) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    // Capture payment
    await razorpayService.capturePayment(paymentId, amount)

    // Create order from client data
    await connectToDatabase()

    const orderData = {
      user: session.user.id,
      items,
      shippingAddress,
      expectedDeliveryDate,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      paymentMethod: 'Razorpay',
      razorpayPaymentId: paymentId,
      razorpayOrderId: orderId,
      isPaid: true,
      paidAt: new Date()
    }

    const createdOrder = await createOrder(orderData)

    return NextResponse.json({
      success: true,
      orderId: createdOrder.data?.orderId,
      message: 'Payment verified and order created successfully',
    })
  } catch (error) {
    console.error('Razorpay payment verification error:', error)
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    )
  }
}
