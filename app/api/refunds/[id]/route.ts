import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { updateRefundStatus } from '@/lib/actions/refund.actions'
import { z } from 'zod'

const refundUpdateSchema = z.object({
  status: z.enum(['approved', 'rejected', 'processed']),
  notes: z.string().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const updateData = refundUpdateSchema.parse(body)
    
    const result = await updateRefundStatus({
      refundId: id,
      status: updateData.status,
      notes: updateData.notes,
    })
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ message: result.message })
  } catch (error) {
    console.error('Update refund status API error:', error)
    
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
