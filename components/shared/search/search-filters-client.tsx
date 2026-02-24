'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import AdvancedSearchFilters from './advanced-search-filters'

interface SearchFiltersClientProps {
  searchParams: {
    q?: string
    category?: string
    brand?: string
    price?: string
    rating?: string
    minPrice?: string
    maxPrice?: string
    inStock?: boolean
    freeShipping?: boolean
  }
}

export default function SearchFiltersClient({ 
  searchParams 
}: SearchFiltersClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  
  const handleFiltersChange = (filters: any) => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value.toString())
      }
    })
    
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <AdvancedSearchFilters 
      searchParams={searchParams}
      onFiltersChange={handleFiltersChange}
    />
  )
}
