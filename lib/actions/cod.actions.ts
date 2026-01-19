'use server'

import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import Order, { IOrder } from '@/lib/db/models/order.model'
import { revalidatePath } from 'next/cache'

interface CODPaymentData {
  orderId: string
  amount: number
  collectedBy: string
  notes?: string
}

export async function markCODAsPaid(data: CODPaymentData): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: 'Unauthorized' }
    }

    await connectToDatabase()
    const order = await Order.findById(data.orderId)
    
    if (!order) {
      return { success: false, message: 'Order not found' }
    }

    if (order.paymentMethod !== 'Cash On Delivery') {
      return { success: false, message: 'This order is not a COD order' }
    }

    // Update COD payment details
    order.codPayment = {
      isPaid: true,
      paidAt: new Date(),
      paymentMethod: 'Cash On Delivery',
      amount: data.amount,
      collectedBy: data.collectedBy,
      notes: data.notes,
    }

    // Mark order as paid
    order.isPaid = true
    order.paidAt = new Date()

    await order.save()
    revalidatePath(`/account/orders/${data.orderId}`)
    
    return { success: true, message: 'COD payment marked as paid successfully' }
  } catch (error) {
    console.error('Mark COD as paid error:', error)
    return { success: false, message: 'Failed to mark COD payment as paid' }
  }
}

export async function updateCODPaymentStatus(orderId: string, status: 'pending' | 'partial' | 'failed'): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: 'Unauthorized' }
    }

    await connectToDatabase()
    const order = await Order.findById(orderId)
    
    if (!order) {
      return { success: false, message: 'Order not found' }
    }

    if (order.paymentMethod !== 'Cash On Delivery') {
      return { success: false, message: 'This order is not a COD order' }
    }

    // Update COD payment status
    if (order.codPayment) {
      switch (status) {
        case 'pending':
          order.codPayment.isPaid = false
          order.codPayment.paidAt = undefined
          break
        case 'partial':
          order.codPayment.isPaid = true
          break
        case 'failed':
          order.codPayment.isPaid = false
          order.codPayment.notes = `Payment failed: ${new Date().toISOString()}`
          break
      }
    }

    await order.save()
    revalidatePath(`/account/orders/${orderId}`)
    
    return { success: true, message: 'COD payment status updated successfully' }
  } catch (error) {
    console.error('Update COD payment status error:', error)
    return { success: false, message: 'Failed to update COD payment status' }
  }
}

export async function getCODOrders(): Promise<IOrder[]> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return []
    }

    await connectToDatabase()
    const orders = await Order.find({
      user: session.user.id,
      paymentMethod: 'Cash On Delivery',
    }).sort({ createdAt: -1 })

    return orders
  } catch (error) {
    console.error('Get COD orders error:', error)
    return []
  }
}
