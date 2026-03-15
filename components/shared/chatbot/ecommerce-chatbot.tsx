'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MessageCircle, 
  Send, 
  ShoppingBag, 
  Package, 
  Search, 
  HelpCircle,
  Bot,
  Sparkles,
  TrendingUp,
  Star,
  ShoppingCart,
  User,
  Clock,
  CheckCircle
} from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  type: 'text' | 'product_recommendation' | 'order_status' | 'cart_assistance'
  metadata?: {
    products?: any[]
    orderInfo?: any
    cartItems?: any[]
  }
}

interface ChatSession {
  id: string
  messages: ChatMessage[]
  context?: {
    userPreferences?: any
  }
}

export default function EcommerceChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([
    'Show me laptops under ₹50,000',
    'Track my last order',
    'What are today\'s deals?',
    'Help me find running shoes',
    'Show me trending products',
    'Recommend gifts for birthday',
    'Help with checkout process',
    'Find best deals on electronics',
    'Show me cart items',
    'Compare products',
    'Help me return a product',
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Initialize chat session
    initializeChat()
  }, [])

  const initializeChat = async () => {
    try {
      const response = await fetch('/api/chatbot')
      const data = await response.json()
      
      if (data.success) {
        setMessages(data.messages || [])
        setSessionId(data.session?.id)
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      type: 'text',
    }

    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          sessionId: sessionId,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.response.content,
          timestamp: new Date(),
          type: data.response.type,
          metadata: data.response.metadata,
        }

        setMessages(prev => [...prev, assistantMessage])
        setSessionId(data.sessionId)
        
        // Update suggestions based on context
        updateSuggestions(data.response.content)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const updateSuggestions = (responseContent: string) => {
    const lowerContent = responseContent.toLowerCase()
    
    if (lowerContent.includes('product') || lowerContent.includes('laptop') || lowerContent.includes('shoe')) {
      setSuggestions([
        'Tell me more about this product',
        'Show similar products',
        'Check customer reviews',
        'Add to wishlist',
        'Compare specifications',
      ])
    } else if (lowerContent.includes('order') || lowerContent.includes('track')) {
      setSuggestions([
        'Track delivery status',
        'Contact customer support',
        'Modify shipping address',
        'Request faster delivery',
        'Check order history',
      ])
    } else if (lowerContent.includes('cart') || lowerContent.includes('checkout')) {
      setSuggestions([
        'Apply discount code',
        'View cart summary',
        'Proceed to checkout',
        'Save for later',
        'Remove items',
      ])
    } else {
      setSuggestions([
        'Search products by category',
        'Filter by price range',
        'Show today\'s deals',
        'Recommend products for me',
        'Help with sizing',
      ])
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion)
    inputRef.current?.focus()
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getMessageIcon = (type: string, role: string) => {
    if (role === 'user') {
      return <User className="h-4 w-4 text-blue-600" />
    }

    switch (type) {
      case 'product_recommendation':
        return <Sparkles className="h-4 w-4 text-green-600" />
      case 'order_status':
        return <Package className="h-4 w-4 text-blue-600" />
      case 'cart_assistance':
        return <ShoppingCart className="h-4 w-4 text-orange-600" />
      default:
        return <Bot className="h-4 w-4 text-purple-600" />
    }
  }

  const formatMessageContent = (content: string, metadata?: any) => {
    if (metadata?.products) {
      return (
        <div className="space-y-2">
          <div>{content}</div>
          {metadata.products.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {metadata.products.map((product: any, index: number) => (
                <div key={index} className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <div className="font-semibold">{product.name}</div>
                      <div className="text-sm text-gray-600">
                        <div>₹{product.price}</div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400" />
                          <span>{product.avgRating || 'No rating'}</span>
                        </div>
                        <div className="text-xs text-green-600">
                          {product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of stock'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    return <div className="whitespace-pre-wrap">{content}</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold">Shopping Assistant</h2>
          </div>
          <p className="text-sm text-gray-600">Your personal AI shopping helper</p>
        </div>

        {/* Quick Suggestions */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium mb-2">Quick Actions</h3>
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left text-sm text-gray-700 hover:text-primary hover:bg-blue-50 px-2 py-1 rounded transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Help Topics */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium mb-2">Help Topics</h3>
          <div className="space-y-1">
            <button className="w-full text-left text-sm text-gray-700 hover:text-primary hover:bg-blue-50 px-2 py-1 rounded transition-colors">
              🔍 Product Search
            </button>
            <button className="w-full text-left text-sm text-gray-700 hover:text-primary hover:bg-blue-50 px-2 py-1 rounded transition-colors">
              📦 Order Tracking
            </button>
            <button className="w-full text-left text-sm text-gray-700 hover:text-primary hover:bg-blue-50 px-2 py-1 rounded transition-colors">
              🛒 Cart Management
            </button>
            <button className="w-full text-left text-sm text-gray-700 hover:text-primary hover:bg-blue-50 px-2 py-1 rounded transition-colors">
              💰 Deals & Offers
            </button>
            <button className="w-full text-left text-sm text-gray-700 hover:text-primary hover:bg-blue-50 px-2 py-1 rounded transition-colors">
              🎁 Gift Ideas
            </button>
            <button className="w-full text-left text-sm text-gray-700 hover:text-primary hover:bg-blue-50 px-2 py-1 rounded transition-colors">
              📞 Customer Support
            </button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Amazona Assistant</h2>
              <Badge variant="secondary" className="text-xs">
                Online
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </Button>
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Clear Chat
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getMessageIcon(message.type, message.role)}
                      <span className="text-xs font-medium">
                        {message.role === 'user' ? 'You' : 'Assistant'}
                      </span>
                    </div>
                    <div className="text-sm">
                      {formatMessageContent(message.content, message.metadata)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDateTime(message.timestamp).dateTime}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg max-w-xs">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <span className="text-sm">Assistant is typing...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              disabled={isLoading}
            />
            <Button 
              onClick={sendMessage} 
              disabled={isLoading || !inputMessage.trim()}
              size="icon"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Dynamic Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestions.slice(0, 4).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
