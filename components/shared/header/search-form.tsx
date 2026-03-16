'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import VoiceSearch from './voice-search'
import { SearchIcon, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SearchForm({
  placeholder,
  categories,
  tHeaderAll,
}: {
  placeholder: string
  categories: string[]
  tHeaderAll: string
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleVoiceResult = (text: string) => {
    setQuery(text)
    router.push(`/search?q=${encodeURIComponent(text)}&category=${category}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}&category=${category}`)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex items-center w-full max-w-2xl text-sm relative group transition-all duration-500',
      )}
    >
      {/* Ambient glow effect */}
      <div
        className={cn(
          'absolute -inset-1 rounded-full blur-xl transition-all duration-500 pointer-events-none',
          isFocused
            ? 'bg-primary/20 opacity-100'
            : 'bg-primary/5 opacity-0 group-hover:opacity-60'
        )}
      />

      {/* Main search wrapper */}
      <div
        className={cn(
          'relative flex items-center w-full rounded-full overflow-hidden transition-all duration-300',
          'border backdrop-blur-xl',
          isFocused
            ? 'border-primary/60 shadow-[0_0_0_1px_hsl(var(--primary)/0.3),0_8px_32px_hsl(var(--primary)/0.15)]'
            : 'border-border/50 shadow-lg hover:border-primary/30',
          'bg-card/60'
        )}
      >
        {/* Category Dropdown */}
        <div className='relative flex items-center border-r border-border/40 shrink-0'>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={cn(
              'h-12 bg-transparent appearance-none',
              'pl-4 pr-7 text-xs uppercase tracking-widest font-medium',
              'text-muted-foreground hover:text-primary cursor-pointer',
              'outline-none border-none focus:ring-0 transition-colors duration-200',
              'max-w-[120px]'
            )}
          >
            <option value='all'>{tHeaderAll}</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className='absolute right-2 w-3 h-3 text-muted-foreground pointer-events-none' />
        </div>

        {/* Search Input */}
        <div className='flex-1 relative flex items-center h-12'>
          <input
            ref={inputRef}
            type='text'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={cn(
              'w-full h-full bg-transparent border-none outline-none ring-0',
              'px-4 text-sm text-foreground',
              'placeholder:text-muted-foreground/50 placeholder:font-light placeholder:tracking-wide',
              'transition-all duration-300'
            )}
          />

          {/* Voice search */}
          <div className='absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1'>
            <VoiceSearch onResult={handleVoiceResult} />
          </div>
        </div>

        {/* Search Button */}
        <button
          type='submit'
          className={cn(
            'h-12 w-14 flex items-center justify-center flex-shrink-0',
            'bg-primary/10 hover:bg-primary transition-all duration-300',
            'text-primary hover:text-primary-foreground',
            'group/btn relative overflow-hidden'
          )}
        >
          {/* Button shimmer effect */}
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700' />
          <SearchIcon className='w-5 h-5 relative z-10' />
        </button>
      </div>

      {/* Subtle bottom accent line */}
      <div
        className={cn(
          'absolute bottom-0 left-1/2 -translate-x-1/2 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent transition-all duration-500',
          isFocused ? 'w-3/4 opacity-100' : 'w-0 opacity-0'
        )}
      />
    </form>
  )
}
