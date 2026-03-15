'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, Mail, Check, Calendar, User, MapPin } from 'lucide-react'
import { formatDateTime, formatCurrency } from '@/lib/utils'

interface InvoiceItem {
  name: string
  description?: string
  quantity: number
  unitPrice: number
  total: number
  image: string
  sku: string
}

interface InvoiceData {
  invoiceNumber: string
  orderDate: string
  dueDate: string
  customer: {
    name: string
    email: string
    address: {
      fullName: string
      street: string
      city: string
      province: string
      postalCode: string
      country: string
      phone: string
    }
  }
  items: InvoiceItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  paymentMethod: string
  status: string
}

interface InvoiceDisplayProps {
  orderId: string
}

export default function InvoiceDisplay({ orderId }: InvoiceDisplayProps) {
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  useEffect(() => {
    fetchInvoice()
  }, [])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${orderId}`)
      const data = await response.json()
      
      if (data.success) {
        setInvoiceData(data.invoice)
      } else {
        console.error('Failed to load invoice:', data.error)
      }
    } catch (error) {
      console.error('Error fetching invoice:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async () => {
    setDownloadingPdf(true)
    try {
      // Generate PDF content (in a real app, you'd use a PDF library like jsPDF)
      // For demo purposes, we'll create a simple text representation
      if (!invoiceData) return

      const pdfContent = `
INVOICE: ${invoiceData.invoiceNumber}
==========================================

BILL TO:
${invoiceData.customer.name}
${invoiceData.customer.address.street}
${invoiceData.customer.address.city}, ${invoiceData.customer.address.province} ${invoiceData.customer.address.postalCode}
${invoiceData.customer.address.country}
${invoiceData.customer.address.phone}
${invoiceData.customer.email}

ORDER DATE: ${formatDateTime(new Date(invoiceData.orderDate)).dateOnly}
DUE DATE: ${formatDateTime(new Date(invoiceData.dueDate)).dateOnly}

PAYMENT METHOD: ${invoiceData.paymentMethod}
STATUS: ${invoiceData.status.toUpperCase()}

ITEMS:
${invoiceData.items.map((item, index) => `
${index + 1}. ${item.name}
   ${item.description || 'No description available'}
   SKU: ${item.sku}
   Quantity: ${item.quantity}
   Unit Price: ${formatCurrency(item.unitPrice)}
   Total: ${formatCurrency(item.total)}
`).join('\n')}

------------------------------------------
SUBTOTAL: ${formatCurrency(invoiceData.subtotal)}
SHIPPING: ${formatCurrency(invoiceData.shipping)}
TAX: ${formatCurrency(invoiceData.tax)}
TOTAL: ${formatCurrency(invoiceData.total)}

Thank you for your business!
      `.trim()

      // Create blob and download
      const blob = new Blob([pdfContent], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoiceData.invoiceNumber}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
    } finally {
      setDownloadingPdf(false)
    }
  }

  const sendEmailInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'send-email' }),
      })

      const result = await response.json()
      
      if (result.success) {
        alert('Invoice sent to your email!')
      } else {
        alert('Failed to send invoice: ' + result.error)
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Failed to send invoice')
    }
  }

  const markAsPaid = async () => {
    try {
      const response = await fetch(`/api/invoices/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'mark-paid' }),
      })

      const result = await response.json()
      
      if (result.success) {
        alert('Order marked as paid!')
        fetchInvoice() // Refresh data
      } else {
        alert('Failed to mark as paid: ' + result.error)
      }
    } catch (error) {
      console.error('Error marking as paid:', error)
      alert('Failed to mark as paid')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!invoiceData) {
    return (
      <div className="container-elite py-8">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600">Invoice Not Found</h2>
          <p className="text-gray-500">The invoice you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
        </div>
      </div>
    )
  }

  const statusColors = {
    processing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    shipped: 'bg-blue-100 text-blue-800 border-blue-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  }

  return (
    <div className="container-elite py-8 print:py-4">
      {/* Invoice Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Invoice {invoiceData.invoiceNumber}
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant={invoiceData.status === 'delivered' ? 'default' : 'secondary'} className="text-sm">
                {invoiceData.status.toUpperCase()}
              </Badge>
              <Button variant="outline" size="sm" onClick={sendEmailInvoice}>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline" size="sm" onClick={downloadPDF} disabled={downloadingPdf}>
                <Download className="h-4 w-4 mr-2" />
                {downloadingPdf ? 'Downloading...' : 'Download PDF'}
              </Button>
              {invoiceData.status === 'processing' && (
                <Button variant="default" size="sm" onClick={markAsPaid}>
                  <Check className="h-4 w-4 mr-2" />
                  Mark as Paid
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Bill To</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{invoiceData.customer.name}</p>
                    <p className="text-sm text-gray-600">{invoiceData.customer.email}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>{invoiceData.customer.address.fullName}</p>
                  <p>{invoiceData.customer.address.street}</p>
                  <p>{invoiceData.customer.address.city}, {invoiceData.customer.address.province} {invoiceData.customer.address.postalCode}</p>
                  <p>{invoiceData.customer.address.country}</p>
                  <p>{invoiceData.customer.address.phone}</p>
                </div>
              </div>

              {/* Order Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Order Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm">Order Date</p>
                      <p className="font-medium">{formatDateTime(new Date(invoiceData.orderDate)).dateOnly}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm">Due Date</p>
                      <p className="font-medium">{formatDateTime(new Date(invoiceData.dueDate)).dateOnly}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm">Payment Method</p>
                      <p className="font-medium">{invoiceData.paymentMethod}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="flex items-center gap-2">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <span className="ml-2 font-medium">{item.name}</span>
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">
                      {item.description || '-'}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm">
                      {item.sku}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm">
                      {item.quantity}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm font-medium">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(invoiceData.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping:</span>
              <span className="font-medium">{formatCurrency(invoiceData.shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax:</span>
              <span className="font-medium">{formatCurrency(invoiceData.tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span className="text-primary">{formatCurrency(invoiceData.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
