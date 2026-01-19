'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mic, MicOff, Search, Volume2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export function VoiceSearch() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supported, setSupported] = useState(true)
  const router = useRouter()
  const recognitionRef = useRef<any>(null)

  const handleVoiceSearch = async (query: string) => {
    if (!query.trim()) return

    setIsProcessing(true)
    try {
      // Here you would typically send the transcript to your search API
      // For now, we'll just navigate to the search page with the query
      router.push(`/search?q=${encodeURIComponent(query)}`)
    } catch (error) {
      console.error('Voice search error:', error)
      setError('Failed to process voice search')
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        setSupported(false)
        return
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex
        const transcript = event.results[current][0].transcript
        setTranscript(transcript)

        if (event.results[current].isFinal) {
          handleVoiceSearch(transcript)
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setError(`Error: ${event.error}`)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [handleVoiceSearch])

  const toggleListening = () => {
    if (!supported) return

    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      recognitionRef.current?.start()
    }
  }

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  if (!supported) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-4">
          <div className="text-center">
            <MicOff className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Voice search is not supported in your browser
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Try using Chrome, Edge, or Safari
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-medium flex items-center justify-center gap-2">
              <Volume2 className="h-4 w-4" />
              Voice Search
            </h3>
            <p className="text-sm text-gray-600">
              Click the microphone and speak to search
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={toggleListening}
              disabled={isProcessing}
              size="lg"
              className={`relative h-16 w-16 rounded-full ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isProcessing ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : isListening ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>
          </div>

          {isListening && (
            <div className="text-center">
              <Badge variant="secondary" className="animate-pulse">
                Listening...
              </Badge>
            </div>
          )}

          {transcript && (
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{transcript}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => speakText(transcript)}
                  className="flex-1"
                >
                  <Volume2 className="h-3 w-3 mr-1" />
                  Play
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleVoiceSearch(transcript)}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <Search className="h-3 w-3 mr-1" />
                  Search
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center">
            <p>Try saying things like:</p>
            <ul className="mt-1 space-y-1">
              <li>• &quot;Show me laptops under $500&quot;</li>
              <li>• &quot;Find iPhone accessories&quot;</li>
              <li>• &quot;Search for gaming products&quot;</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
