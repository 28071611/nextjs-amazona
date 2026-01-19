"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  max?: number
  min?: number
  step?: number
  className?: string
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value, onValueChange, max = 100, min = 0, step = 1, ...props }, ref
) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value)
    onValueChange([newValue, newValue + 100]) // Simple range implementation
  }

  return (
    <div
      ref={ref}
      className={cn("w-full space-y-2", className)}
      {...props}
    >
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={handleChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(value[0] / max) * 100}%, #e5e7eb ${(value[0] / max) * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>${value[0]}</span>
          <span>${value[1]}</span>
        </div>
      </div>
    </div>
  )
})

Slider.displayName = "Slider"

export { Slider }
