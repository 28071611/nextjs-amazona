import { Metadata } from 'next'
import { auth } from '@/auth'
import { notFound } from 'next/navigation'
import EcommerceChatbot from '@/components/shared/chatbot/ecommerce-chatbot'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Shopping Assistant - Amazona',
  description: 'AI-powered shopping assistant to help you find products, track orders, and get the best deals',
  keywords: 'shopping assistant, AI chatbot, product search, order tracking, customer support',
}

export default async function ChatbotPage() {
  const session = await auth()
  if (!session) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
        <EcommerceChatbot />
      </Suspense>
    </div>
  )
}
