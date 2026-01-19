import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getCODOrders } from '@/lib/actions/cod.actions'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const orders = await getCODOrders()
    
    return NextResponse.json({
      orders,
    })
  } catch (error) {
    console.error('Get COD orders API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
