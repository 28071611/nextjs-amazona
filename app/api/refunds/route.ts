import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getAllRefunds } from '@/lib/actions/refund.actions'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const refunds = await getAllRefunds()
    
    return NextResponse.json({
      refunds,
    })
  } catch (error) {
    console.error('Get refunds API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
