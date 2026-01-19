import { Resend } from 'resend'
import { emailTemplates } from './email-templates'

interface EmailService {
  sendOrderConfirmation: (data: any) => Promise<void>
  sendOrderShipped: (data: any) => Promise<void>
  sendOrderDelivered: (data: any) => Promise<void>
  sendPasswordReset: (data: any) => Promise<void>
  sendWelcomeEmail: (data: any) => Promise<void>
}

class EmailNotificationService implements EmailService {
  private resend: Resend | null
  private isEnabled: boolean

  constructor() {
    const apiKey = process.env.RESEND_API_KEY
    this.isEnabled = !!apiKey && apiKey !== ''
    this.resend = this.isEnabled ? new Resend(apiKey) : null
  }

  async sendOrderConfirmation(data: any): Promise<void> {
    if (!this.isEnabled) {
      console.log('Email service disabled - skipping order confirmation email')
      return
    }
    
    try {
      const { customerName, orderNumber, orderTotal, items } = data
      
      await this.resend!.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: [customerName], // This would come from user data
        subject: emailTemplates.orderPlaced.subject,
        html: emailTemplates.orderPlaced.html({
          customerName,
          orderNumber,
          orderTotal,
          items,
        }),
      })

      console.log('Order confirmation email sent to:', customerName)
    } catch (error) {
      console.error('Failed to send order confirmation email:', error)
      throw error
    }
  }

  async sendOrderShipped(data: any): Promise<void> {
    if (!this.isEnabled) {
      console.log('Email service disabled - skipping order shipped email')
      return
    }
    
    try {
      const { customerName, orderNumber, trackingNumber } = data
      
      await this.resend!.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: [customerName],
        subject: emailTemplates.orderShipped.subject,
        html: emailTemplates.orderShipped.html({
          customerName,
          orderNumber,
          trackingNumber,
        }),
      })

      console.log('Order shipped email sent to:', customerName)
    } catch (error) {
      console.error('Failed to send order shipped email:', error)
      throw error
    }
  }

  async sendOrderDelivered(data: any): Promise<void> {
    if (!this.isEnabled) {
      console.log('Email service disabled - skipping order delivered email')
      return
    }
    
    try {
      const { customerName, orderNumber } = data
      
      await this.resend!.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: [customerName],
        subject: emailTemplates.orderDelivered.subject,
        html: emailTemplates.orderDelivered.html({
          customerName,
          orderNumber,
        }),
      })

      console.log('Order delivered email sent to:', customerName)
    } catch (error) {
      console.error('Failed to send order delivered email:', error)
      throw error
    }
  }

  async sendPasswordReset(data: any): Promise<void> {
    if (!this.isEnabled) {
      console.log('Email service disabled - skipping password reset email')
      return
    }
    
    try {
      const { resetToken, userName } = data
      
      await this.resend!.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: [userName],
        subject: emailTemplates.passwordReset.subject,
        html: emailTemplates.passwordReset.html({
          userName,
          resetToken,
        }),
      })

      console.log('Password reset email sent to:', userName)
    } catch (error) {
      console.error('Failed to send password reset email:', error)
      throw error
    }
  }

  async sendWelcomeEmail(data: any): Promise<void> {
    if (!this.isEnabled) {
      console.log('Email service disabled - skipping welcome email')
      return
    }
    
    try {
      const { customerName } = data
      
      await this.resend!.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: [customerName],
        subject: emailTemplates.welcomeEmail.subject,
        html: emailTemplates.welcomeEmail.html({
          customerName,
        }),
      })

      console.log('Welcome email sent to:', customerName)
    } catch (error) {
      console.error('Failed to send welcome email:', error)
      throw error
    }
  }
}

export const emailService = new EmailNotificationService()
export default emailService
