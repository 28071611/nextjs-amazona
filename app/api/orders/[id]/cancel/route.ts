import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const { reason } = await req.json()

        await connectToDatabase()
        const order = await Order.findById(id)
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Only the order owner or admin can cancel
        const isOwner = order.user.toString() === session.user.id
        const isAdmin = session.user.role === 'Admin'
        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Can only cancel if not yet shipped
        const cancellableStatuses = ['Placed', 'Packed']
        if (!cancellableStatuses.includes(order.orderStatus || 'Placed')) {
            return NextResponse.json(
                { error: 'Order cannot be cancelled at this stage' },
                { status: 400 }
            )
        }

        order.orderStatus = 'Cancelled'
        order.isCancelled = true
        order.cancelledAt = new Date()
        order.cancelReason = reason || 'Cancelled by user'
        order.statusHistory = order.statusHistory || []
        order.statusHistory.push({
            status: 'Cancelled',
            updatedAt: new Date(),
            note: reason || 'Cancelled by user',
        })

        await order.save()

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Cancel order error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
