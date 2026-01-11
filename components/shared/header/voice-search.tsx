'use client'

import { useState, useEffect } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function VoiceSearch({ onResult }: { onResult: (text: string) => void }) {
    const [isListening, setIsListening] = useState(false)
    const [recognition, setRecognition] = useState<any>(null)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
            if (SpeechRecognition) {
                const recog = new SpeechRecognition()
                recog.continuous = false
                recog.interimResults = false
                recog.lang = 'en-US'

                recog.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript
                    onResult(transcript)
                    setIsListening(false)
                }

                recog.onerror = (event: any) => {
                    console.error('Speech recognition error:', event.error)
                    setIsListening(false)
                }

                recog.onend = () => {
                    setIsListening(false)
                }

                setRecognition(recog)
            }
        }
    }, [onResult])

    const toggleListening = () => {
        if (isListening) {
            recognition?.stop()
        } else {
            recognition?.start()
            setIsListening(true)
        }
    }

    if (!recognition) return null

    return (
        <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={toggleListening}
            className={isListening ? 'text-red-500 animate-pulse' : ''}
        >
            {isListening ? <MicOff className='w-5 h-5' /> : <Mic className='w-5 h-5' />}
        </Button>
    )
}
