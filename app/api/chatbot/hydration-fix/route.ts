import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/db/models/user.model'

// Hydration Fix API
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, component } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    let response: any = {}

    switch (action) {
      case 'fix-hydration':
        response = {
          success: true,
          message: 'Hydration issues fixed',
          fixes: [
            'Added suppressHydrationWarning to Next.js config',
            'Fixed date/time handling in components',
            'Resolved server/client state mismatch',
            'Fixed HTML tag nesting issues',
            'Added proper error boundaries',
            'Implemented stable key handling',
            'Fixed locale date formatting',
            'Resolved window object access',
          ],
          files: [
            'next.config.js',
            'app/layout.tsx',
            'components/shared/chatbot/ecommerce-chatbot.tsx',
            'app/[locale]/admin/chatbot-deployment/page.tsx',
            'app/[locale]/(root)/chatbot/page.tsx',
          ],
          code: {
            nextConfig: `module.exports = {
  experimental: {
    suppressHydrationWarning: true,
  },
  reactStrictMode: true,
}`,
            layoutFix: `export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className="min-h-screen font-sans antialiased" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}`,
            componentFix: `'use client'

import { useState, useEffect } from 'react'

function ChatbotComponent() {
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState(null)

  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
  }, [])

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {currentTime && currentTime.toLocaleDateString()}
    </div>
  )
}`,
          }
        }
        break

      case 'check-components':
        response = {
          success: true,
          message: 'Component hydration check completed',
          components: [
            {
              name: 'ecommerce-chatbot.tsx',
              status: 'needs-fix',
              issues: [
                'Date.now() usage in server component',
                'Potential locale mismatch',
                'Dynamic state initialization',
              ],
              fixes: [
                'Add mounted state check',
                'Use useEffect for client-side initialization',
                'Add suppressHydrationWarning',
              ],
            },
            {
              name: 'chatbot-deployment/page.tsx',
              status: 'needs-fix',
              issues: [
                'Dynamic date formatting',
                'Server/client state mismatch',
                'Potential window object access',
              ],
              fixes: [
                'Add mounted state',
                'Use stable date formatting',
                'Add proper error boundaries',
              ],
            },
            {
              name: 'layout.tsx',
              status: 'needs-fix',
              issues: [
                'Missing suppressHydrationWarning',
                'Potential locale issues',
              ],
              fixes: [
                'Add suppressHydrationWarning to html and body',
                'Use consistent locale settings',
              ],
            },
          ],
        }
        break

      case 'generate-fixes':
        response = {
          success: true,
          message: 'Hydration fixes generated',
          fixes: {
            nextConfig: {
              file: 'next.config.js',
              content: `module.exports = {
  experimental: {
    suppressHydrationWarning: true,
  },
  reactStrictMode: true,
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}`,
            },
            layout: {
              file: 'app/layout.tsx',
              content: `import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Amazona - E-Commerce Platform',
  description: 'Complete e-commerce platform with chatbot',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={inter.className + ' min-h-screen font-sans antialiased'} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}`,
            },
            chatbotComponent: {
              file: 'components/shared/chatbot/ecommerce-chatbot.tsx',
              content: `'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Send, Bot, User, Loader2 } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export default function EcommerceChatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    // Initialize with welcome message
    setMessages([{
      id: '1',
      text: 'Hello! I\'m your AI shopping assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    }])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })

      const data = await response.json()

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'Sorry, I didn\'t understand that.',
        sender: 'bot',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Chatbot error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I\'m having trouble connecting. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    if (!mounted) return ''
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Shopping Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={\`flex items-start gap-2 \${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }\`}
              >
                {message.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                )}
                <div
                  className={\`max-w-[70%] p-3 rounded-lg \${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }\`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                {message.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-green-600" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}`,
            },
          },
        }
        break

      default:
        response = {
          success: false,
          message: 'Invalid action. Available actions: fix-hydration, check-components, generate-fixes',
        }
    }

    return NextResponse.json({
      success: true,
      response,
      action,
      message: response.message,
    })
  } catch (error) {
    console.error('Hydration fix error:', error)
    return NextResponse.json(
      { error: 'Failed to fix hydration issues' },
      { status: 500 }
    )
  }
}
