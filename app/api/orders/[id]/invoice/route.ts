import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await connectToDatabase()
    const order = await Order.findById(id).populate('user', 'name email')
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const isOwner = (order.user as any)._id?.toString() === session.user.id
    const isAdmin = session.user.role === 'Admin'
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric',
    })

    const itemsHtml = order.items.map((item: { name: string; quantity: number; price: number }) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">₹${item.price.toFixed(2)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('')

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Invoice #${order._id}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 24px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; }
    .logo { font-size:26px; font-weight:bold; color:#4f46e5; }
    .invoice-title { font-size:14px; color:#666; }
    .badge { display:inline-block; background:#4f46e5; color:#fff; border-radius:4px; padding:2px 10px; font-size:12px; margin-top:4px; }
    .section-title { font-weight:bold; color:#4f46e5; border-bottom:2px solid #4f46e5; padding-bottom:4px; margin-top:28px; margin-bottom:12px; }
    table { width:100%; border-collapse:collapse; }
    th { background:#f5f5f5; padding:10px 8px; text-align:left; font-size:13px; }
    td { padding:8px; font-size:13px; }
    .totals { margin-top:16px; margin-left:auto; width:260px; }
    .totals tr td:first-child { color:#555; }
    .totals tr td:last-child { text-align:right; font-weight:500; }
    .total-row td { font-weight:bold; font-size:15px; border-top:2px solid #4f46e5; padding-top:8px; }
    .footer { margin-top:48px; text-align:center; color:#aaa; font-size:11px; }
    @media print { body { padding: 0; } .no-print { display:none; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">NextAmazona</div>
      <div class="invoice-title">Tax Invoice / Receipt</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:13px;">Invoice No: <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong></div>
      <div style="font-size:13px;margin-top:4px;">Date: <strong>${dateStr}</strong></div>
      <div style="margin-top:6px;"><span class="badge">${order.isPaid ? 'PAID' : 'UNPAID'}</span></div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
    <div>
      <div class="section-title">Bill To</div>
      <div><strong>${order.shippingAddress.fullName}</strong></div>
      <div>${order.shippingAddress.street}</div>
      <div>${order.shippingAddress.city}, ${order.shippingAddress.province} - ${order.shippingAddress.postalCode}</div>
      <div>${order.shippingAddress.country}</div>
      <div>Phone: ${order.shippingAddress.phone}</div>
    </div>
    <div>
      <div class="section-title">Order Info</div>
      <div>Payment Method: <strong>${order.paymentMethod}</strong></div>
      <div>Order Status: <strong>${order.orderStatus || 'Placed'}</strong></div>
      ${order.isPaid && order.paidAt ? `<div>Paid At: <strong>${new Date(order.paidAt).toLocaleDateString()}</strong></div>` : ''}
    </div>
  </div>

  <div class="section-title">Order Items</div>
  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th style="text-align:center;">Qty</th>
        <th style="text-align:right;">Unit Price</th>
        <th style="text-align:right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <table class="totals">
    <tr><td>Subtotal:</td><td>₹${order.itemsPrice.toFixed(2)}</td></tr>
    <tr><td>Tax:</td><td>₹${order.taxPrice.toFixed(2)}</td></tr>
    <tr><td>Shipping:</td><td>₹${order.shippingPrice.toFixed(2)}</td></tr>
    <tr class="total-row"><td>Grand Total:</td><td>₹${order.totalPrice.toFixed(2)}</td></tr>
  </table>

  <div class="footer">
    Thank you for shopping with NextAmazona! · For queries contact support@nextamazona.com
  </div>

  <div class="no-print" style="text-align:center;margin-top:32px;">
    <button onclick="window.print()" style="background:#4f46e5;color:#fff;border:none;padding:10px 28px;border-radius:6px;font-size:14px;cursor:pointer;">🖨️ Print Invoice</button>
  </div>
</body>
</html>`

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (error) {
    console.error('Invoice error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
