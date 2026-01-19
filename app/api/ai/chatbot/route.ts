import { NextRequest, NextResponse } from 'next/server'
import { getGeminiResponse } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const prompt = `
    You are a helpful customer service chatbot for an e-commerce store. 
    Help customers with questions about products, orders, returns, shipping, and general inquiries.
    
    Context about the store: ${context || 'General e-commerce store'}
    
    Customer message: "${message}"
    
    Provide a helpful, friendly, and concise response. If you don't know something, admit it and suggest contacting customer service.
    
    Only return the response message, nothing else.
    `

    const response = await getGeminiResponse(prompt)

    return NextResponse.json({ 
      response: response || 'I apologize, but I cannot assist with that request right now. Please contact our customer service team for further help.'
    })
  } catch (error) {
    console.error('Chatbot error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
