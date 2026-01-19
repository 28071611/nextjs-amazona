import { NextRequest, NextResponse } from 'next/server'
import { predictDemand } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { salesData } = await request.json()
    
    if (!salesData || !Array.isArray(salesData)) {
      return NextResponse.json({ error: 'Sales data is required' }, { status: 400 })
    }

    const prediction = await predictDemand(salesData)

    return NextResponse.json({ 
      predictions: prediction?.predictions || [],
      explanation: prediction?.explanation || 'No explanation available'
    })
  } catch (error) {
    console.error('Demand prediction error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
