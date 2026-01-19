'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Sparkles } from 'lucide-react'

export function SmartSearch() {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const router = useRouter()

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch('/api/ai/smart-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      })

      if (response.ok) {
        const data = await response.json()
        // Navigate to search page with refined query parameters
        const params = new URLSearchParams({
          q: data.refinedQuery.query || searchQuery,
          ...(data.refinedQuery.category && { category: data.refinedQuery.category }),
          ...(data.refinedQuery.brand && { tag: data.refinedQuery.brand }),
        })
        
        router.push(`/search?${params.toString()}`)
      } else {
        // Fallback to regular search if AI search fails
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      }
    } catch (error) {
      console.error('Smart search error:', error)
      // Fallback to regular search
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getSuggestions = async (input: string) => {
    if (input.length < 2) {
      setSuggestions([])
      return
    }

    try {
      const response = await fetch('/api/ai/smart-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input }),
      })

      if (response.ok) {
        const data = await response.json()
        // Extract product names from results for suggestions
        const productNames = data.products.slice(0, 5).map((product: any) => product.name)
        setSuggestions(productNames)
      }
    } catch (error) {
      console.error('Suggestions error:', error)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      getSuggestions(query)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query])

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search products... (AI-powered)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pr-20"
        />
        <div className="absolute right-0 top-0 flex">
          <Button
            size="sm"
            variant="ghost"
            className="h-full px-2"
            onClick={() => handleSearch()}
            disabled={isSearching}
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-full px-2 text-blue-600"
            onClick={() => handleSearch()}
            disabled={isSearching}
            title="AI Smart Search"
          >
            <Sparkles className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {suggestions.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
              onClick={() => {
                setQuery(suggestion)
                setSuggestions([])
                handleSearch(suggestion)
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
