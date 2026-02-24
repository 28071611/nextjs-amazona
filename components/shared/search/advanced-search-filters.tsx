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
import { getAllCategories, getAllTags, getAllBrands } from '@/lib/actions/product.actions'
import { getFilterUrl } from '@/lib/utils'

interface AdvancedSearchFiltersProps {
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
  onFiltersChange: (filters: any) => void
}

export default function AdvancedSearchFilters({ 
  searchParams, 
  onFiltersChange 
}: AdvancedSearchFiltersProps) {
  const [categories, setCategories] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 30000])
  const [selectedRating, setSelectedRating] = useState(0)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [freeShippingOnly, setFreeShippingOnly] = useState(false)

  useEffect(() => {
    const loadFilters = async () => {
      const [categoriesData, tagsData, brandsData] = await Promise.all([
        getAllCategories(),
        getAllTags(),
        getAllBrands()
      ])
      setCategories(categoriesData)
      setTags(tagsData)
      setBrands(brandsData)
    }
    
    loadFilters()
  }, [])

  const applyFilters = () => {
    const filters: any = {
      ...searchParams,
    }

    if (priceRange[0] > 0 || priceRange[1] < 30000) {
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
    setPriceRange([0, 30000])
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
    priceRange[0] > 0 || priceRange[1] < 30000,
    selectedRating > 0,
    inStockOnly,
    freeShippingOnly
  ].filter(Boolean).length

  return (
    <div className='elite-card elite-shadow-hover p-6'>
      <div className="flex justify-between items-center mb-6">
        <h3 className="h3-bold elite-heading font-light tracking-tight">Advanced Filters</h3>
        <div className="flex items-center gap-3">
          {activeFiltersCount > 0 && (
            <Badge className="bg-primary/20 text-primary border-primary/30 font-light">
              {activeFiltersCount} active
            </Badge>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={clearFilters}
            className="border-border/50 hover:border-primary/30 font-light"
          >
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>
      
      <div className="space-y-8">
        {/* Category Filter */}
        <div>
          <h4 className="font-light text-sm tracking-wider uppercase text-foreground/80 mb-4">Category</h4>
          <Select onValueChange={(value) => onFiltersChange({ ...searchParams, category: value })}>
            <SelectTrigger className="border-border/50 focus:border-primary/30">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Brand Filter */}
        <div>
          <h4 className="font-light text-sm tracking-wider uppercase text-foreground/80 mb-4">Brand</h4>
          <Select onValueChange={(value) => onFiltersChange({ ...searchParams, brand: value })}>
            <SelectTrigger className="border-border/50 focus:border-primary/30">
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

        {/* Price Range */}
        <div>
          <h4 className="font-light text-sm tracking-wider uppercase text-foreground/80 mb-4">Price Range</h4>
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={30000}
              min={0}
              step={500}
              className="w-full"
            />
            <div className="flex justify-between text-sm font-light text-foreground/60 mt-3">
              <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
              <span>₹{priceRange[1].toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <h4 className="font-light text-sm tracking-wider uppercase text-foreground/80 mb-4">Customer Rating</h4>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedRating === rating}
                  onCheckedChange={() => setSelectedRating(selectedRating === rating ? 0 : rating)}
                  className="border-border/50 data-checked:border-primary data-checked:bg-primary"
                />
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < rating
                            ? 'fill-primary text-primary'
                            : 'text-primary/20'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-light text-foreground/80">
                    {rating === 5 ? '5 Stars' : `${rating} Stars & Up`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock & Shipping Filters */}
        <div className="space-y-4">
          <h4 className="font-light text-sm tracking-wider uppercase text-foreground/80 mb-4">Availability</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={inStockOnly}
                onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
                className="border-border/50 data-checked:border-primary data-checked:bg-primary"
              />
              <span className="text-sm font-light text-foreground/80">In Stock Only</span>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={freeShippingOnly}
                onCheckedChange={(checked) => setFreeShippingOnly(checked as boolean)}
                className="border-border/50 data-checked:border-primary data-checked:bg-primary"
              />
              <span className="text-sm font-light text-foreground/80">Free Shipping</span>
            </div>
          </div>
        </div>

        {/* Apply Filters Button */}
        <Button onClick={applyFilters} className="elite-button w-full">
          <Filter className="h-4 w-4 mr-2" />
          Apply Filters
        </Button>
      </div>
    </div>
  )
}
