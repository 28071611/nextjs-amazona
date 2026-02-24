'use client'

import { ChangeEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Upload } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface LocalUploadButtonProps {
    onUploadComplete: (url: string) => void
}

export default function LocalUploadButton({ onUploadComplete }: LocalUploadButtonProps) {
    const [isUploading, setIsUploading] = useState(false)
    const { toast } = useToast()

    const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (!res.ok) throw new Error('Upload failed')

            const data = await res.json()
            if (data.success) {
                onUploadComplete(data.url)
                toast({
                    description: 'Image uploaded successfully',
                })
            } else {
                throw new Error(data.message || 'Upload failed')
            }
        } catch (error) {
            console.error("Upload error:", error)
            toast({
                variant: 'destructive',
                description: 'Failed to upload image',
            })
        } finally {
            setIsUploading(false)
            // Reset input
            e.target.value = ''
        }
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                type="button"
                variant="secondary"
                disabled={isUploading}
                onClick={() => document.getElementById('local-upload-input')?.click()}
            >
                {isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Upload className="mr-2 h-4 w-4" />
                )}
                Upload Image
            </Button>
            <input
                id="local-upload-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
            />
        </div>
    )
}
