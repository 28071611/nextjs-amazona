import { NextRequest, NextResponse } from 'next/server'
import { validateCoupon } from '@/lib/actions/coupon.actions'
import { z } from 'zod'
import { CouponApplySchema } from '@/lib/validator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = CouponApplySchema.parse(body)

    const result = await validateCoupon(code)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Validate coupon API error:', error)
    
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
