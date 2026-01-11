import { Resend } from 'resend'
import PurchaseReceiptEmail from './purchase-receipt'
import { IOrder } from '@/lib/db/models/order.model'
import AskReviewOrderItemsEmail from './ask-review-order-items'
import { SENDER_EMAIL, SENDER_NAME } from '@/lib/constants'

let resend: Resend | null | undefined

const getResend = () => {
  if (resend !== undefined) return resend
  if (!process.env.RESEND_API_KEY) {
    resend = null
    return resend
  }
  resend = new Resend(process.env.RESEND_API_KEY)
  return resend
}

export const sendPurchaseReceipt = async ({ order }: { order: IOrder }) => {
  const resend = getResend()
  if (!resend) return
  await resend.emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: (order.user as { email: string }).email,
    subject: 'Order Confirmation',
    react: <PurchaseReceiptEmail order={order} />,
  })
}

export const sendAskReviewOrderItems = async ({ order }: { order: IOrder }) => {
  const resend = getResend()
  if (!resend) return
  const oneDayFromNow = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()

  await resend.emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: (order.user as { email: string }).email,
    subject: 'Review your order items',
    react: <AskReviewOrderItemsEmail order={order} />,
    scheduledAt: oneDayFromNow,
  })
}
