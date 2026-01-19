import { NextRequest, NextResponse } from 'next/server'
import { detectFakeReview } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { reviewText } = await request.json()
    
    if (!reviewText) {
      return NextResponse.json({ error: 'Review text is required' }, { status: 400 })
    }

    const analysis = await detectFakeReview(reviewText)

    return NextResponse.json({ 
      isFake: analysis.isFake,
      confidence: analysis.confidence,
      reason: analysis.reason
    })
  } catch (error) {
    console.error('Fake review detection error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
