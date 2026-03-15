import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'
import { sendShippingNotification } from '@/emails'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session || session.user.role !== 'Admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const { status, note } = await req.json()

        const validStatuses = ['Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered']
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
        }

        await connectToDatabase()
        const order = await Order.findById(id).populate('user', 'name email')
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        order.orderStatus = status
        order.statusHistory = order.statusHistory || []
        order.statusHistory.push({ status, updatedAt: new Date(), note })

        // Auto-mark delivered
        if (status === 'Delivered') {
            order.isDelivered = true
            order.deliveredAt = new Date()
        }

        await order.save()

        // Send notification email
        try {
            await sendShippingNotification({ order, newStatus: status, note })
        } catch (emailErr) {
            console.error('Email send error:', emailErr)
        }

        return NextResponse.json({ success: true, orderStatus: order.orderStatus })
    } catch (error) {
        console.error('Update order status error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
