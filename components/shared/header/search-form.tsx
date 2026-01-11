'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import VoiceSearch from './voice-search'
import { SearchIcon } from 'lucide-react'

export default function SearchForm({ placeholder, categories, tHeaderAll }: {
    placeholder: string,
    categories: string[],
    tHeaderAll: string
}) {
    const [query, setQuery] = useState('')
    const [category, setCategory] = useState('all')
    const router = useRouter()

    const handleVoiceResult = (text: string) => {
        setQuery(text)
        // Optionally auto-submit
        router.push(`/search?q=${encodeURIComponent(text)}&category=${category}`)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        router.push(`/search?q=${encodeURIComponent(query)}&category=${category}`)
    }

    return (
        <form onSubmit={handleSubmit} className='flex items-stretch h-10 w-full max-w-xl'>
            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className='w-auto h-full dark:border-gray-200 bg-gray-100 text-black border-r rounded-l-md px-2 text-sm'
            >
                <option value='all'>{tHeaderAll}</option>
                {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                ))}
            </select>
            <div className='flex-1 relative flex items-center'>
                <Input
                    className='flex-1 rounded-none dark:border-gray-200 bg-gray-100 text-black text-base h-full pr-10'
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <div className='absolute right-2'>
                    <VoiceSearch onResult={handleVoiceResult} />
                </div>
            </div>
            <button
                type='submit'
                className='bg-primary text-primary-foreground rounded-r-md h-full px-3 py-2'
            >
                <SearchIcon className='w-6 h-6' />
            </button>
        </form>
    )
}
