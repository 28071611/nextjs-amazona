'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  MessageCircle,
  Send,
  X,
  Bot,
  User,
  Volume2,
  VolumeX,
  Sparkles,
  Minus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  role: 'bot' | 'user'
  content: string
}

const STORE_CONTEXT = `You are an elite AI shopping assistant for Amazona, a premium Indian e-commerce store. 
You help customers find products, answer questions about orders, shipping, returns, and policies.
Key store facts:
- We sell fashion, electronics, watches, and accessories
- All prices are in Indian Rupees (₹)
- Free shipping on orders above ₹500
- 7-day easy return policy
- Payment methods: Credit/Debit Card, UPI, Net Banking, Cash on Delivery, PayPal, Stripe
- Standard delivery: 3-5 business days
- Express delivery: 1-2 business days
Always be helpful, friendly, and concise. Use ₹ for prices.`

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content:
        'Namaste! 🙏 I\'m your Amazona shopping assistant. How can I help you today? I can assist with products, orders, shipping, returns, and more!',
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const speak = useCallback((text: string) => {
    if (!ttsEnabled || typeof window === 'undefined' || !window.speechSynthesis)
      return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    utterance.pitch = 1.05
    utterance.lang = 'en-IN'
    // Try to find an Indian English voice
    const voices = window.speechSynthesis.getVoices()
    const indianVoice =
      voices.find((v) => v.lang === 'en-IN') ||
      voices.find((v) => v.lang.startsWith('en'))
    if (indianVoice) utterance.voice = indianVoice
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    speechSynthRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [ttsEnabled])

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage },
    ]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: STORE_CONTEXT,
          history: messages.slice(-6).map((m) => ({
            role: m.role === 'bot' ? 'assistant' : 'user',
            content: m.content,
          })),
        }),
      })

      const data = await response.json()
      const reply =
        data.response ||
        data.reply ||
        "I'm sorry, I couldn't process that. Please try again."
      setMessages((prev) => [...prev, { role: 'bot', content: reply }])
      speak(reply)
    } catch {
      const errMsg =
        'I apologize, I\'m having trouble connecting right now. Please try again in a moment.'
      setMessages((prev) => [...prev, { role: 'bot', content: errMsg }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className='fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3'>
      {/* Chat Panel */}
      {isOpen && (
        <div
          className={cn(
            'flex flex-col rounded-2xl overflow-hidden transition-all duration-300 shadow-2xl',
            'w-[360px] border border-primary/20',
            'bg-gradient-to-b from-[hsl(30,10%,6%)] to-[hsl(30,10%,4%)]',
            isMinimized ? 'h-0 opacity-0 pointer-events-none' : 'h-[520px] opacity-100'
          )}
        >
          {/* Header */}
          <div className='flex items-center justify-between px-4 py-3 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10'>
            <div className='flex items-center gap-2'>
              <div className='relative'>
                <div className='w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg'>
                  <Bot className='w-4 h-4 text-primary-foreground' />
                </div>
                <span className='absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-background' />
              </div>
              <div>
                <p className='text-sm font-semibold text-foreground tracking-wide'>Amazona AI</p>
                <p className='text-xs text-muted-foreground'>
                  {isLoading ? (
                    <span className='animate-pulse text-primary'>Thinking...</span>
                  ) : (
                    'Always here to help ✨'
                  )}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-1'>
              {/* TTS Toggle */}
              <button
                onClick={() => {
                  setTtsEnabled(!ttsEnabled)
                  if (isSpeaking) stopSpeaking()
                }}
                title={ttsEnabled ? 'Disable voice' : 'Enable voice'}
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center transition-colors',
                  ttsEnabled
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {ttsEnabled ? (
                  <Volume2 className='w-3.5 h-3.5' />
                ) : (
                  <VolumeX className='w-3.5 h-3.5' />
                )}
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className='w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors'
              >
                <Minus className='w-3.5 h-3.5' />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className='w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors'
              >
                <X className='w-3.5 h-3.5' />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className='flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth'
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  'flex gap-2 items-end',
                  m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center',
                    m.role === 'bot'
                      ? 'bg-gradient-to-br from-primary to-accent'
                      : 'bg-secondary'
                  )}
                >
                  {m.role === 'bot' ? (
                    <Bot className='w-3 h-3 text-primary-foreground' />
                  ) : (
                    <User className='w-3 h-3 text-secondary-foreground' />
                  )}
                </div>
                {/* Bubble */}
                <div
                  className={cn(
                    'max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed',
                    m.role === 'bot'
                      ? 'bg-card/80 border border-border/50 text-foreground rounded-tl-sm'
                      : 'bg-primary text-primary-foreground rounded-tr-sm'
                  )}
                >
                  {m.content}
                  {/* Speak button for bot messages */}
                  {m.role === 'bot' && (
                    <button
                      onClick={() => speak(m.content)}
                      className='mt-1 block text-muted-foreground hover:text-primary transition-colors'
                      title='Read aloud'
                    >
                      <Volume2 className='w-3 h-3' />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className='flex gap-2 items-end'>
                <div className='w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-primary to-accent'>
                  <Bot className='w-3 h-3 text-primary-foreground' />
                </div>
                <div className='bg-card/80 border border-border/50 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center'>
                  <span className='w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0ms]' />
                  <span className='w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:150ms]' />
                  <span className='w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:300ms]' />
                </div>
              </div>
            )}
          </div>

          {/* Quick Suggestions */}
          <div className='px-4 pb-2 flex gap-1.5 flex-wrap'>
            {['Track my order', 'Return policy', 'Best deals today'].map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className='text-xs px-2.5 py-1 rounded-full border border-primary/30 text-primary/80 hover:bg-primary/10 transition-colors'
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className='px-4 pb-4 pt-2 border-t border-primary/10'>
            <div className='flex gap-2 items-end'>
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Ask me anything... (Enter to send)'
                className='flex-1 min-h-[40px] max-h-[100px] resize-none text-sm bg-card/50 border-border/50 focus-visible:ring-primary/40 rounded-xl'
                rows={1}
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                size='icon'
                className='h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 flex-shrink-0'
              >
                <Send className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          setIsMinimized(false)
        }}
        className={cn(
          'relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300',
          'bg-gradient-to-br from-primary via-primary to-accent',
          'hover:scale-110 active:scale-95',
          isOpen && 'rotate-90'
        )}
      >
        {/* Golden glow */}
        <div className='absolute inset-0 rounded-full bg-primary/30 blur-md -z-10 animate-pulse' />
        {isOpen ? (
          <X className='w-6 h-6 text-primary-foreground' />
        ) : (
          <>
            <MessageCircle className='w-6 h-6 text-primary-foreground' />
            <Sparkles className='absolute top-1 right-1 w-3 h-3 text-yellow-200' />
          </>
        )}
        {/* Unread dot */}
        {!isOpen && (
          <span className='absolute top-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-background' />
        )}
      </button>
    </div>
  )
}
