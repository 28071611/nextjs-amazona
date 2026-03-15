import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import Product from '@/lib/db/models/product.model'
import Order from '@/lib/db/models/order.model'
import User from '@/lib/db/models/user.model'

import { ChatSession, ChatMessage } from '@/lib/db/models/chatbot.model'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { message, type = 'text', sessionId } = body

    await connectToDatabase()

    // Create or update chat session
    let chatSession
    if (sessionId) {
      // Update existing session
      chatSession = await ChatSession.findOne({ id: sessionId, userId: session.user.id })
      if (chatSession) {
        chatSession.messages.push({
          role: 'user',
          content: message,
          timestamp: new Date(),
          type,
        })
        chatSession.lastActivity = new Date()
        await chatSession.save()
      }
    } else {
      // Create new session
      chatSession = new ChatSession({
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: session.user.id,
        messages: [{
          role: 'user',
          content: message,
          timestamp: new Date(),
          type,
        }],
        createdAt: new Date(),
        lastActivity: new Date(),
        context: {
          userPreferences: await getUserPreferences(session.user.id),
          browsingHistory: await getBrowsingHistory(session.user.id),
        },
      })
      await chatSession.save()
    }

    // Process message and generate AI response
    const aiResponse = await generateAIResponse(message, type, chatSession, session.user.id)

    // Add AI response to session
    chatSession.messages.push({
      role: 'assistant',
      content: aiResponse.content,
      timestamp: new Date(),
      type: aiResponse.type,
      metadata: aiResponse.metadata,
    })
    chatSession.lastActivity = new Date()
    await chatSession.save()

    return NextResponse.json({
      success: true,
      response: aiResponse,
      sessionId: chatSession.id,
      messages: chatSession.messages.slice(-10), // Return last 10 messages
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    await connectToDatabase()

    let chatSession
    if (sessionId) {
      chatSession = await ChatSession.findOne({ id: sessionId, userId: session.user.id })
    } else {
      // Get or create latest session for user
      chatSession = await ChatSession.findOne({ userId: session.user.id })
        .sort({ createdAt: -1 })
    }

    if (!chatSession) {
      // Create new session if none exists
      chatSession = new ChatSession({
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: session.user.id,
        messages: [{
          role: 'assistant',
          content: 'Hello! 👋 I\'m your personal shopping assistant. How can I help you today? I can help you with:\n\n🔍 **Product Search** - Find any product you\'re looking for\n🛒 **Order Tracking** - Check your order status\n📋 **Cart Management** - View or modify your cart\n💰 **Deal Recommendations** - Get the best offers\n🎁 **Gift Suggestions** - Find perfect gifts\n\nJust ask me anything! 🛍️',
          timestamp: new Date(),
          type: 'text',
        }],
        createdAt: new Date(),
        lastActivity: new Date(),
        context: {
          userPreferences: await getUserPreferences(session.user.id),
          browsingHistory: await getBrowsingHistory(session.user.id),
        },
      })
      await chatSession.save()
    }

    return NextResponse.json({
      success: true,
      session: chatSession,
      messages: chatSession.messages.slice(-50), // Return last 50 messages
    })
  } catch (error) {
    console.error('Chat session error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat session' },
      { status: 500 }
    )
  }
}

// AI Response Generation
async function generateAIResponse(
  userMessage: string,
  messageType: string,
  session: any,
  userId: string
): Promise<{
  content: string
  type: string
  metadata?: any
}> {
  const lowerMessage = userMessage.toLowerCase()

  // Product Search
  if (lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('show me')) {
    const searchTerms = extractSearchTerms(userMessage)
    const products = await Product.find({
      isPublished: true,
      $or: [
        { name: { $regex: searchTerms.join('|'), $options: 'i' } },
        { category: { $regex: searchTerms.join('|'), $options: 'i' } },
        { tags: { $in: searchTerms } },
      ],
    }).limit(5)

    if (products.length > 0) {
      return {
        content: `I found ${products.length} products matching your search:\n\n${products.map((p, i) =>
          `${i + 1}. **${p.name}** - ₹${p.price}\n   ${p.description}\n   ⭐ ${p.avgRating || 'No rating'} | 📦 ${p.countInStock} in stock\n   [View Product](/product/${p.slug})`
        ).join('\n\n')}`,
        type: 'product_recommendation',
        metadata: { products },
      }
    }
  }

  // Order Status
  if (lowerMessage.includes('order') || lowerMessage.includes('track') || lowerMessage.includes('status')) {
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .limit(3)

    if (orders.length > 0) {
      return {
        content: `Here are your recent orders:\n\n${orders.map((order, i) =>
          `${i + 1}. **Order #${order._id.toString().slice(-6)}**\n   Status: ${order.orderStatus}\n   Total: ₹${order.totalPrice}\n   Date: ${order.createdAt.toLocaleDateString()}\n   Items: ${order.items.length} products\n   [Track Order](/track-order/${order._id})`
        ).join('\n\n')}`,
        type: 'order_status',
        metadata: { orderInfo: orders },
      }
    }
  }

  // Cart Assistance
  if (lowerMessage.includes('cart') || lowerMessage.includes('basket')) {
    return {
      content: 'I can help you with your cart! Here\'s what I can do:\n\n🛒 **View Cart Items** - Show all items in your cart\n📊 **Cart Summary** - See total amount and savings\n💰 **Apply Coupons** - Find available discounts\n🚚 **Checkout** - Guide you through payment\n\nWhat would you like to do with your cart?',
      type: 'cart_assistance',
    }
  }

  // Help and Support
  if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
    return {
      content: `🤖 **Amazona Assistant Help Center**\n\nI can help you with:\n\n🔍 **Product Search** - Find any product\n🛒 **Order Tracking** - Track your orders\n📋 **Cart Management** - View or modify your cart\n💰 **Deal Recommendations** - Get the best offers\n🎁 **Gift Suggestions** - Find perfect gifts\n📞 **Customer Support** - Connect with human support\n🔄 **Returns & Refunds** - Help with returns\n📧 **Account Management** - Update profile and preferences\n\n**Quick Commands:**\n• "Show me laptops under ₹50,000"\n• "Track my last order"\n• "What are today\'s deals?"\n• "Help with checkout"\n\nHow can I assist you today? 🛍️`,
      type: 'text',
    }
  }

  // Default intelligent response
  const responses = [
    "I'd be happy to help you find the perfect product! What are you looking for today?",
    "I can assist you with order tracking, product recommendations, or cart management. What would you like to do?",
    "Welcome back! I'm here to help with your shopping needs. How can I assist you today?",
    "I can help you find great deals and recommendations. What's your budget or preference?",
  ]

  const randomResponse = responses[Math.floor(Math.random() * responses.length)]

  return {
    content: randomResponse,
    type: 'text',
  }
}

// Helper functions
function extractSearchTerms(message: string): string[] {
  const words = message.toLowerCase().split(' ')
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']

  return words
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .slice(0, 3) // Take first 3 relevant terms
}

async function getUserPreferences(userId: string) {
  // Mock user preferences - in real app, fetch from database
  return {
    preferredCategories: ['Electronics', 'Fashion'],
    budgetRange: '10000-50000',
    preferredBrands: ['Apple', 'Samsung', 'Nike'],
  }
}

async function getBrowsingHistory(userId: string) {
  // Mock browsing history - in real app, fetch from database
  return [
    { product: 'Laptop', viewedAt: new Date(Date.now() - 86400000) },
    { product: 'Running Shoes', viewedAt: new Date(Date.now() - 172800000) },
  ]
}
