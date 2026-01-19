import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getCoupons } from '@/lib/actions/coupon.actions'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const coupons = await getCoupons()
    
    return NextResponse.json(coupons)
  } catch (error) {
    console.error('Get coupons API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const result = await createCoupon(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ message: result.message })
  } catch (error) {
    console.error('Create coupon API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function createCoupon(data: any) {
  const { createCoupon } = await import('@/lib/actions/coupon.actions')
  return createCoupon(data)
}
