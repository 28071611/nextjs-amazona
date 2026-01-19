import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { markCODAsPaid } from '@/lib/actions/cod.actions'
import { z } from 'zod'

const codPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  amount: z.number().min(0, 'Amount is required'),
  collectedBy: z.string().min(1, 'Collected by is required'),
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
    const paymentData = codPaymentSchema.parse(body)
    
    const result = await markCODAsPaid(paymentData)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ message: result.message })
  } catch (error) {
    console.error('Mark COD as paid API error:', error)
    
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
