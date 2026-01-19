import { NextRequest, NextResponse } from 'next/server'
import { detectFraud } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()
    
    if (!orderData) {
      return NextResponse.json({ error: 'Order data is required' }, { status: 400 })
    }

    const fraudAnalysis = await detectFraud(orderData)

    return NextResponse.json({ 
      isFraudulent: fraudAnalysis.isFraudulent,
      riskScore: fraudAnalysis.riskScore,
      reason: fraudAnalysis.reason
    })
  } catch (error) {
    console.error('Fraud detection error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
