'use server'

import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import Order, { IOrder } from '@/lib/db/models/order.model'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

interface RefundRequest {
  orderId: string
  amount: number
  reason: string
  notes?: string
}

interface RefundUpdate {
  refundId: string
  status: 'approved' | 'rejected' | 'processed'
  notes?: string
}

const refundRequestSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  amount: z.number().min(0.01, 'Refund amount must be greater than 0'),
  reason: z.string().min(1, 'Refund reason is required'),
  notes: z.string().optional(),
})

const refundUpdateSchema = z.object({
  refundId: z.string().min(1, 'Refund ID is required'),
  status: z.enum(['approved', 'rejected', 'processed']),
  notes: z.string().optional(),
})

export async function requestRefund(data: RefundRequest): Promise<{ success: boolean; message: string; refundId?: string }> {
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

    if (!order.isDelivered) {
      return { success: false, message: 'Order must be delivered before refund can be processed' }
    }

    // Generate unique refund ID
    const refundId = `RFD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    
    // Add refund to order
    const refund: NonNullable<IOrder['refunds']>[number] = {
      refundId,
      amount: data.amount,
      reason: data.reason,
      status: 'pending',
      processedBy: session.user.name || undefined,
      notes: data.notes,
    }

    // Initialize refunds array if it doesn't exist
    if (!order.refunds) {
      order.refunds = []
    }

    order.refunds.push(refund)
    await order.save()
    revalidatePath(`/account/orders/${data.orderId}`)
    
    return { 
      success: true, 
      message: 'Refund request submitted successfully',
      refundId 
    }
  } catch (error) {
    console.error('Request refund error:', error)
    return { success: false, message: 'Failed to submit refund request' }
  }
}

export async function updateRefundStatus(data: RefundUpdate): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: 'Unauthorized' }
    }

    await connectToDatabase()
    const order = await Order.findOne({ 'refunds.refundId': data.refundId })
    
    if (!order) {
      return { success: false, message: 'Order not found' }
    }

    if (!order.refunds) {
      return { success: false, message: 'No refunds found for this order' }
    }

    // Find the refund to update
    const refund = order.refunds.find(r => r.refundId === data.refundId)
    
    if (!refund) {
      return { success: false, message: 'Refund not found' }
    }

    // Update refund status
    refund.status = data.status
    refund.processedAt = data.status === 'processed' ? new Date() : undefined
    refund.processedBy = session.user.name || undefined
    refund.notes = data.notes

    await order.save()
    revalidatePath(`/account/orders/${order._id}`)
    
    return { success: true, message: 'Refund status updated successfully' }
  } catch (error) {
    console.error('Update refund status error:', error)
    return { success: false, message: 'Failed to update refund status' }
  }
}

export async function getOrderRefunds(orderId: string): Promise<any[]> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return []
    }

    await connectToDatabase()
    const order = await Order.findById(orderId)
    
    if (!order) {
      return []
    }

    return JSON.parse(JSON.stringify(order.refunds || [])) as any[]
  } catch (error) {
    console.error('Get order refunds error:', error)
    return []
  }
}

export async function getAllRefunds(): Promise<any[]> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return []
    }

    await connectToDatabase()
    const orders = await Order.find({
      'refunds.0': { $exists: true },
    })
      .populate('user', 'name email')
      .select('refunds _id user items totalPrice isDelivered createdAt')

    const allRefunds: any[] = []
    orders.forEach(order => {
      if (order.refunds && order.refunds.length > 0) {
        order.refunds.forEach(refund => {
          allRefunds.push({
            ...JSON.parse(JSON.stringify(refund)),
            orderId: order._id,
            orderNumber: order._id.toString().slice(-6),
            customerName: (order.user as any)?.name,
            customerEmail: (order.user as any)?.email,
            orderTotal: order.totalPrice,
            orderDate: order.createdAt,
          })
        })
      }
    })

    return allRefunds
  } catch (error) {
    console.error('Get all refunds error:', error)
    return []
  }
}
