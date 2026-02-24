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
        <form onSubmit={handleSubmit} className='flex items-center w-full max-w-2xl text-sm relative group'>
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-all duration-500 opacity-0 group-hover:opacity-100" />

            <div className="relative flex items-center w-full bg-card/50 backdrop-blur-md rounded-full border border-border/60 hover:border-primary/50 transition-colors shadow-lg overflow-hidden">
                <div className="relative border-r border-border/50">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className='h-12 bg-transparent text-muted-foreground border-none outline-none pl-4 pr-8 appearance-none cursor-pointer hover:text-primary transition-colors text-xs uppercase tracking-wide font-medium'
                    >
                        <option value='all'>{tHeaderAll}</option>
                        {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div className='flex-1 relative flex items-center h-12'>
                    <Input
                        className='w-full h-full border-none bg-transparent shadow-none focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/50 px-4'
                        placeholder={placeholder}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className='absolute right-2 top-1/2 -translate-y-1/2'>
                        <VoiceSearch onResult={handleVoiceResult} />
                    </div>
                </div>

                <button
                    type='submit'
                    className='h-12 w-14 flex items-center justify-center bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground transition-all duration-300'
                >
                    <SearchIcon className='w-5 h-5' />
                </button>
            </div>
        </form>
    )
}
