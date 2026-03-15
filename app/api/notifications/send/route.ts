import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/db/models/user.model'
import { revalidatePath } from 'next/cache'

interface NotificationRequest {
  userId?: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  actionUrl?: string
  actionText?: string
  isGlobal?: boolean
}

interface EmailNotificationData {
  to: string
  subject: string
  htmlContent: string
  textContent?: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body: NotificationRequest = await request.json()
    const { userId, title, message, type, actionUrl, actionText, isGlobal } = body

    await connectToDatabase()

    // Send to specific user or all users
    const targetUsers = isGlobal
      ? await User.find({ isSubscribedToNotifications: true })
      : userId
        ? await User.find({ _id: userId })
        : []

    if (targetUsers.length === 0) {
      return NextResponse.json(
        { error: 'No users found' },
        { status: 404 }
      )
    }

    const notifications = targetUsers.map(user => ({
      userId: user._id,
      title,
      message,
      type,
      actionUrl,
      actionText,
      isRead: false,
      createdAt: new Date(),
    }))

    // Save notifications to database (in a real app, you'd have a notifications collection)
    // For now, we'll send emails directly

    const emailPromises = targetUsers.map(async (user) => {
      const emailData: EmailNotificationData = {
        to: user.email,
        subject: title,
        htmlContent: generateEmailTemplate(title, message, type, actionUrl, actionText),
        textContent: generateTextEmailTemplate(title, message, type, actionUrl, actionText),
      }

      // Here you would integrate with your email service (Resend, SendGrid, etc.)
      // For demo purposes, we'll just log the email
      console.log(`Email to ${user.email}:`, emailData.subject)

      return { success: true, email: user.email }
    })

    const emailResults = await Promise.allSettled(emailPromises)
    const successfulEmails = emailResults.filter(result => result.status === 'fulfilled').length
    const failedEmails = emailResults.length - successfulEmails

    revalidatePath('/admin/notifications')

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${targetUsers.length} users`,
      emailStats: {
        total: targetUsers.length,
        successful: successfulEmails,
        failed: failedEmails,
      },
    })
  } catch (error) {
    console.error('Send notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

function generateEmailTemplate(title: string, message: string, type: string, actionUrl?: string, actionText?: string): string {
  const typeColors = {
    info: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  }

  const typeIcons = {
    info: '📢',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  }

  const actionButton = actionUrl && actionText ? `
    <div style="text-align: center; margin-top: 20px;">
      <a href="${actionUrl}" style="
        background-color: ${typeColors[type as keyof typeof typeColors]};
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
        display: inline-block;
      ">
        ${actionText}
      </a>
    </div>
  ` : ''

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 20px;
        }
        .content {
          background-color: #ffffff;
          padding: 30px;
          border-radius: 8px;
          border-left: 4px solid ${typeColors[type as keyof typeof typeColors]};
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${typeIcons[type as keyof typeof typeIcons]} ${title}</h1>
      </div>
      
      <div class="content">
        <p>${message}</p>
        ${actionButton}
      </div>
      
      <div class="footer">
        <p>This is an automated message from Amazona Store.</p>
        <p>If you didn't expect this message, please contact our support team.</p>
      </div>
    </body>
    </html>
  `
}

function generateTextEmailTemplate(title: string, message: string, type: string, actionUrl?: string, actionText?: string): string {
  const typeIcons = {
    info: '📢',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  }

  let text = `${typeIcons[type as keyof typeof typeIcons]} ${title}\n\n${message}`

  if (actionUrl && actionText) {
    text += `\n\n${actionText}: ${actionUrl}`
  }

  text += `\n\n---\nThis is an automated message from Amazona Store.\nIf you didn't expect this message, please contact our support team.`

  return text
}
