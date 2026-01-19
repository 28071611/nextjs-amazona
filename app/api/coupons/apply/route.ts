import { NextRequest, NextResponse } from 'next/server'
import { applyCoupon } from '@/lib/actions/coupon.actions'
import { z } from 'zod'
import { CouponApplySchema } from '@/lib/validator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, orderAmount } = CouponApplySchema.extend({
      orderAmount: z.number().min(0),
    }).parse(body)

    const result = await applyCoupon(code, orderAmount)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Apply coupon API error:', error)
    
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
