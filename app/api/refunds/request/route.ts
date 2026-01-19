import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { requestRefund } from '@/lib/actions/refund.actions'
import { z } from 'zod'

const refundRequestSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  amount: z.number().min(0.01, 'Refund amount must be greater than 0'),
  reason: z.string().min(1, 'Refund reason is required'),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const refundData = refundRequestSchema.parse(body)
    
    const result = await requestRefund(refundData)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      message: result.message,
      refundId: result.refundId 
    })
  } catch (error) {
    console.error('Request refund API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
