'use client'

import { Progress } from '@/components/ui/progress'
import Rating from './rating'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ChevronDownIcon } from 'lucide-react'

type RatingSummaryProps = {
  asPopover?: boolean
  avgRating: number
  numReviews: number
  ratingDistribution: {
    rating: number
    count: number
  }[]
}

export default function RatingSummary({
  asPopover,
  avgRating = 0,
  numReviews = 0,
  ratingDistribution = [],
}: RatingSummaryProps) {
  const RatingDistribution = () => {
    const ratingPercentageDistribution = ratingDistribution.map((x) => ({
      ...x,
      percentage: Math.round((x.count / numReviews) * 100),
    }))

    return (
      <div className='space-y-3'>
        {ratingPercentageDistribution
          .sort((a, b) => b.rating - a.rating)
          .map(({ rating, percentage }) => (
            <div
              key={rating}
              className='grid grid-cols-[50px_1fr_30px] gap-2 items-center'
            >
              <div className='text-sm'>
                {' '}
                {rating} star
              </div>
              <Progress value={percentage} className='h-4' />
              <div className='text-sm text-right'>{percentage}%</div>
            </div>
          ))}
      </div>
    )
  }

  return (
    <>
      <div className='flex flex-wrap items-center gap-1 cursor-help'>
        <Rating rating={avgRating} />
        <span className='text-lg font-semibold'>
          {avgRating.toFixed(1)} out of 5
        </span>
      </div>
      <div className='text-lg '>
        {numReviews} ratings
      </div>
      <div className='space-y-3'>
        <RatingDistribution />
        <Separator />
        <div className='flex flex-col gap-2'>
          <Link className='highlight-link text-center' href='#reviews'>
            See customer reviews
          </Link>
        </div>
      </div>
    </>
  )
}
