'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, Send, X, Bot, User } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState<{ role: 'bot' | 'user'; content: string }[]>([
        { role: 'bot', content: 'Hello! How can I help you today?' },
    ])
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMessage = input.trim()
        setInput('')
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
        setIsLoading(true)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage, history: messages }),
            })

            const data = await response.json()
            if (data.reply) {
                setMessages((prev) => [...prev, { role: 'bot', content: data.reply }])
            } else {
                setMessages((prev) => [...prev, { role: 'bot', content: 'Sorry, I encountered an error.' }])
            }
        } catch (error) {
            setMessages((prev) => [...prev, { role: 'bot', content: 'Sorry, I could not connect to the service.' }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='fixed bottom-4 right-4 z-50'>
            {!isOpen ? (
                <Button
                    onClick={() => setIsOpen(true)}
                    className='rounded-full w-14 h-14 shadow-lg flex items-center justify-center p-0'
                >
                    <MessageCircle className='w-6 h-6' />
                </Button>
            ) : (
                <Card className='w-80 h-96 flex flex-col shadow-2xl border-2'>
                    <CardHeader className='p-3 border-b flex flex-row items-center justify-between space-y-0'>
                        <CardTitle className='text-sm flex items-center gap-2'>
                            <Bot className='w-4 h-4 text-primary' /> AI Support
                        </CardTitle>
                        <Button variant='ghost' size='icon' onClick={() => setIsOpen(false)} className='h-8 w-8'>
                            <X className='w-4 h-4' />
                        </Button>
                    </CardHeader>
                    <CardContent className='flex-1 p-0 overflow-hidden'>
                        <ScrollArea className='h-full p-4' ref={scrollRef}>
                            <div className='flex flex-col gap-3'>
                                {messages.map((m, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            'flex gap-2 max-w-[80%]',
                                            m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                                        )}
                                    >
                                        <div className={cn(
                                            'rounded-lg p-2 text-sm',
                                            m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                        )}>
                                            {m.content}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className='flex gap-2 mr-auto max-w-[80%]'>
                                        <div className='rounded-lg p-2 text-sm bg-muted animate-pulse'>
                                            Thinking...
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className='p-3 border-t'>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                handleSend()
                            }}
                            className='flex w-full gap-2'
                        >
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder='Type a message...'
                                className='text-xs h-9'
                            />
                            <Button type='submit' size='icon' className='h-9 w-9' disabled={isLoading}>
                                <Send className='w-4 h-4' />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}
        </div>
    )
}
