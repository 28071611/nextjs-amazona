import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { resetUserPassword } from '@/lib/auth-utils'
import { ResetPasswordSchema } from '@/lib/validator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = ResetPasswordSchema.parse(body)

    const user = await resetUserPassword(token, password)

    return NextResponse.json({
      message: 'Password reset successfully',
      success: true
    })

  } catch (error) {
    console.error('Reset password error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
