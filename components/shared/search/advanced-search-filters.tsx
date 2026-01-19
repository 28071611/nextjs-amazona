'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X, Filter, Star } from 'lucide-react'
import { getAllCategories, getAllTags } from '@/lib/actions/product.actions'
import { getFilterUrl } from '@/lib/utils'

interface AdvancedSearchFiltersProps {
  searchParams: {
    q?: string
    category?: string
    brand?: string
    price?: string
    rating?: string
    minPrice?: number
    maxPrice?: number
    inStock?: boolean
    freeShipping?: boolean
  }
  onFiltersChange: (filters: any) => void
}

export default function AdvancedSearchFilters({ 
  searchParams, 
  onFiltersChange 
}: AdvancedSearchFiltersProps) {
  const [categories, setCategories] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedRating, setSelectedRating] = useState(0)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [freeShippingOnly, setFreeShippingOnly] = useState(false)

  useEffect(() => {
    const loadFilters = async () => {
      const [categoriesData, tagsData] = await Promise.all([
        getAllCategories(),
        getAllTags()
      ])
      setCategories(categoriesData)
      setTags(tagsData)
      
      // Extract unique brands from products (this would typically come from an API call)
      const uniqueBrands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG', 'Dell', 'HP', 'Canon', 'Nikon']
      setBrands(uniqueBrands)
    }
    
    loadFilters()
  }, [])

  const applyFilters = () => {
    const filters: any = {
      ...searchParams,
    }

    if (priceRange[0] > 0 || priceRange[1] < 1000) {
      filters.minPrice = priceRange[0]
      filters.maxPrice = priceRange[1]
    }

    if (selectedRating > 0) {
      filters.rating = selectedRating.toString()
    }

    if (inStockOnly) {
      filters.inStock = 'true'
    }

    if (freeShippingOnly) {
      filters.freeShipping = 'true'
    }

    onFiltersChange(filters)
  }

  const clearFilters = () => {
    setPriceRange([0, 1000])
    setSelectedRating(0)
    setInStockOnly(false)
    setFreeShippingOnly(false)
    
    const clearedFilters = {
      q: searchParams.q || '',
      category: 'all',
      brand: 'all',
      price: 'all',
      rating: 'all',
    }
    
    onFiltersChange(clearedFilters)
  }

  const activeFiltersCount = [
    priceRange[0] > 0 || priceRange[1] < 1000,
    selectedRating > 0,
    inStockOnly,
    freeShippingOnly
  ].filter(Boolean).length

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Advanced Filters</CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">
                {activeFiltersCount} active
              </Badge>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={clearFilters}
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range */}
        <div>
          <h4 className="font-medium mb-3">Price Range</h4>
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={1000}
              min={0}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Brand Filter */}
        <div>
          <h4 className="font-medium mb-3">Brand</h4>
          <Select onValueChange={(value) => onFiltersChange({ ...searchParams, brand: value })}>
            <SelectTrigger>
              <SelectValue placeholder="All brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All brands</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rating Filter */}
        <div>
          <h4 className="font-medium mb-3">Customer Rating</h4>
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedRating === rating}
                  onCheckedChange={() => setSelectedRating(selectedRating === rating ? 0 : rating)}
                />
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">& Up</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock & Shipping Filters */}
        <div className="space-y-4">
          <h4 className="font-medium mb-3">Availability</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">In Stock Only</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={freeShippingOnly}
                onChange={(e) => setFreeShippingOnly(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Free Shipping</span>
            </div>
          </div>
        </div>

        {/* Apply Filters Button */}
        <Button onClick={applyFilters} className="w-full">
          <Filter className="h-4 w-4 mr-2" />
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  )
}
