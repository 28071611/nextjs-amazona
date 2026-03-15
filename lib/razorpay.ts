import Razorpay from 'razorpay'
import crypto from 'crypto'

export interface RazorpayOrder {
  id: string
  entity: string
  amount: number
  amount_paid: number
  amount_due: number
  currency: string
  receipt: string
  offer_id: string | null
  status: string
  attempts: number
  notes: Record<string, any>
  created_at: number
}

export interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: any) => void
  prefill: {
    name?: string
    email?: string
    contact?: string
  }
  theme: {
    color: string
  }
  modal: {
    ondismiss: () => void
  }
}

export class RazorpayService {
  private key_id: string
  private key_secret: string

  constructor() {
    this.key_id = process.env.RAZORPAY_KEY_ID || ''
    this.key_secret = process.env.RAZORPAY_KEY_SECRET || ''
  }

  async createOrder(amount: number, receipt: string): Promise<RazorpayOrder> {
    try {
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.key_id}:${this.key_secret}`).toString('base64')}`,
        },
        body: JSON.stringify({
          amount: amount * 100, // Razorpay expects amount in paise
          currency: 'INR',
          receipt,
          notes: {
            order_type: 'ecommerce_order'
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`Razorpay API error: ${response.statusText}`)
      }

      const order = await response.json()
      return order
    } catch (error) {
      console.error('Error creating Razorpay order:', error)
      throw error
    }
  }

  initializePayment(options: Partial<RazorpayOptions>): void {
    const razorpay = new (window as any).Razorpay({
      key: this.key_id,
      ...options,
    })

    razorpay.open()
  }

  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {

    const generatedSignature = crypto
      .createHmac('sha256', this.key_secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')

    return generatedSignature === signature
  }

  async capturePayment(paymentId: string, amount: number): Promise<any> {
    try {
      const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.key_id}:${this.key_secret}`).toString('base64')}`,
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to paise
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to capture payment: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error capturing Razorpay payment:', error)
      throw error
    }
  }
}

export const razorpayService = new RazorpayService()
