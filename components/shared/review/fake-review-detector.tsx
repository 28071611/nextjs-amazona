'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react'

export function FakeReviewDetector() {
  const [reviewText, setReviewText] = useState('')
  const [analysis, setAnalysis] = useState<{
    isFake: boolean
    confidence: number
    reason: string
  } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeReview = async () => {
    if (!reviewText.trim()) return

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/ai/fake-review-detection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewText }),
      })

      if (response.ok) {
        const data = await response.json()
        setAnalysis(data)
      }
    } catch (error) {
      console.error('Review analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-red-500'
    if (confidence >= 0.6) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High'
    if (confidence >= 0.6) return 'Medium'
    return 'Low'
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          AI-Powered Fake Review Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="review" className="text-sm font-medium">
            Enter review text to analyze:
          </label>
          <Textarea
            id="review"
            placeholder="Paste the review text here to check if it might be fake or spam..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
          />
        </div>

        <Button 
          onClick={analyzeReview} 
          disabled={!reviewText.trim() || isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Review'}
        </Button>

        {analysis && (
          <div className="space-y-3">
            <Card className={`border-2 ${analysis.isFake ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  {analysis.isFake ? (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  <span className="font-medium">
                    {analysis.isFake ? '⚠️ Likely Fake Review' : '✅ Appears to be Genuine'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Confidence:</span>
              <Badge 
                className={`${getConfidenceColor(analysis.confidence)} text-white`}
              >
                {getConfidenceText(analysis.confidence)} ({Math.round(analysis.confidence * 100)}%)
              </Badge>
            </div>

            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">
                <strong>Reason:</strong> {analysis.reason}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
