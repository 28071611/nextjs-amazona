import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/db/models/user.model'
import { createPasswordResetToken } from '@/lib/auth-utils'
import { resend } from '@/lib/email'
import { ForgotPasswordSchema } from '@/lib/validator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = ForgotPasswordSchema.parse(body)

    await connectToDatabase()

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json(
        { error: 'No user found with that email' },
        { status: 404 }
      )
    }

    const resetToken = await createPasswordResetToken(email)
    
    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
    
    // Send email using Resend
    try {
      if (!resend) {
        console.log('Email service disabled, but password reset token created')
        return NextResponse.json({
          message: 'Password reset token created (email service disabled)',
          success: true,
          resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
        })
      }

      const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: [email],
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hello ${(user as any).name},</p>
            <p>You requested a password reset for your account. Click the link below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
              Reset Password
            </a>
            <p>This link will expire in 10 minutes for security reasons.</p>
            <p>If you didn't request this password reset, you can safely ignore this email.</p>
            <p>Thank you,<br>The Amazona Team</p>
          </div>
        `,
      })

      if (error) {
        console.error('Email send error:', error)
        return NextResponse.json(
          { error: 'Failed to send reset email' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Password reset email sent successfully',
        success: true
      })

    } catch (emailError) {
      console.error('Email service error:', emailError)
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Forgot password error:', error)
    
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
