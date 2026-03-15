import { Resend } from 'resend'
import PurchaseReceiptEmail from './purchase-receipt'
import { IOrder } from '@/lib/db/models/order.model'
import AskReviewOrderItemsEmail from './ask-review-order-items'
import ShippingNotificationEmail from './shipping-notification'
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

export const sendShippingNotification = async ({
  order,
  newStatus,
  note,
}: {
  order: IOrder
  newStatus: string
  note?: string
}) => {
  const resend = getResend()
  if (!resend) return
  const statusSubjects: Record<string, string> = {
    Packed: 'Your order is packed and ready to ship',
    Shipped: '🚚 Your order has been shipped!',
    'Out for Delivery': '📦 Your order is out for delivery!',
    Delivered: '✅ Your order has been delivered!',
    Cancelled: 'Your order has been cancelled',
  }
  await resend.emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: (order.user as { email: string }).email,
    subject: statusSubjects[newStatus] ?? `Order Update: ${newStatus}`,
    react: <ShippingNotificationEmail order={order} newStatus={newStatus} note={note} />,
  })
}
