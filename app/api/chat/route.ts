import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: NextRequest) {
    try {
        const { message, history } = await req.json()

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        const chat = model.startChat({
            history: history.map((m: any) => ({
                role: m.role === 'bot' ? 'model' : 'user',
                parts: [{ text: m.content }],
            })),
            generationConfig: {
                maxOutputTokens: 500,
            },
        })

        const systemPrompt = `
      You are an AI customer support assistant for "Amazona", an e-commerce store. 
      Your goal is to help users with:
      - Finding products
      - Checking order status (tell them to check the "Orders" section in their account)
      - Returns and refunds policy (30-day return policy)
      - General inquiries about the store
      
      Be polite, helpful, and concise. 
      If you don't know something, suggest they contact human support at support@amazona.com.
    `

        const result = await chat.sendMessage([
            { text: systemPrompt },
            { text: message }
        ])
        const response = await result.response
        const text = response.text()

        return NextResponse.json({ reply: text })
    } catch (error) {
        console.error('Chat API Error:', error)
        return NextResponse.json({ error: 'Failed to get response from AI' }, { status: 500 })
    }
}
