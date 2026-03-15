'use client'

import { razorpayService, RazorpayOptions } from '@/lib/razorpay'
import { useState } from 'react'

function loadScript(src: string) {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => {
      resolve(true)
    }
    script.onerror = () => {
      resolve(false)
    }
    document.body.appendChild(script)
  })
}

interface RazorpayPaymentProps {
  amount: number
  orderId: string
  customerName: string
  customerEmail: string
  onSuccess: (paymentId: string) => void
  onFailure: (error: any) => void
  onClose: () => void
}

export default function RazorpayPayment({
  amount,
  orderId,
  customerName,
  customerEmail,
  onSuccess,
  onFailure,
  onClose,
}: RazorpayPaymentProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePayment = async () => {
    setIsLoading(true)

    try {
      // Load Razorpay script
      await loadScript('https://checkout.razorpay.com/v1/checkout.js')

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        name: 'Amazona Store',
        description: `Order #${orderId.slice(-6)}`,
        order_id: orderId,
        handler: function (response) {
          // Payment successful
          onSuccess(response.razorpay_payment_id)
        },
        prefill: {
          name: customerName,
          email: customerEmail,
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false)
            onClose()
          },
        },
      }

      razorpayService.initializePayment(options)
    } catch (error) {
      setIsLoading(false)
      onFailure(error)
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          Processing...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.5 4.5C7.5 3.67157 6.82843 3 6 3H5C4.17157 3 3.5 3.67157 3.5 4.5V6.5C3.5 7.32843 4.17157 8 5 8H6C6.82843 8 7.5 7.32843 7.5 6.5V4.5ZM7.5 17.5C7.5 18.3284 6.82843 19 6 19H5C4.17157 19 3.5 18.3284 3.5 17.5V15.5C3.5 14.6716 4.17157 14 5 14H6C6.82843 14 7.5 14.6716 7.5 15.5V17.5ZM16.5 4.5C16.5 3.67157 17.1716 3 18 3H19C19.8284 3 20.5 3.67157 20.5 4.5V6.5C20.5 7.32843 19.8284 8 19 8H18C17.1716 8 16.5 7.32843 16.5 6.5V4.5ZM16.5 17.5C16.5 18.3284 17.1716 19 18 19H19C19.8284 19 20.5 18.3284 20.5 17.5V15.5C20.5 14.6716 19.8284 14 19 14H18C17.1716 14 16.5 14.6716 16.5 15.5V17.5Z" />
          </svg>
          Pay with Razorpay
        </>
      )}
    </button>
  )
}
