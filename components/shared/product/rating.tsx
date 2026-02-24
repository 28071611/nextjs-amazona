import React from 'react'
import { Star } from 'lucide-react'

export default function Rating({
  rating = 0,
  size = 4,
}: {
  rating: number
  size?: number
}) {
  const fullStars = Math.floor(rating)
  const partialStar = rating % 1
  const emptyStars = 5 - Math.ceil(rating)

  const starSizeClass = size === 4 ? 'w-4 h-4' : size === 6 ? 'w-6 h-6' : 'w-5 h-5'

  return (
    <div
      className='flex items-center gap-1'
      aria-label={`Rating: ${rating} out of 5 stars`}
    >
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className={`${starSizeClass} fill-primary text-primary transition-all duration-700`}
        />
      ))}
      {partialStar > 0 && (
        <div className='relative'>
          <Star className={`${starSizeClass} text-primary/20`} />
          <div
            className='absolute top-0 left-0 overflow-hidden transition-all duration-700'
            style={{ width: `${partialStar * 100}%` }}
          >
            <Star className={`${starSizeClass} fill-primary text-primary`} />
          </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star
          key={`empty-${i}`}
          className={`${starSizeClass} text-primary/20 transition-all duration-700`}
        />
      ))}
    </div>
  )
}
