'use server'

import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import Coupon, { ICoupon } from '@/lib/db/models/coupon.model'
import { z } from 'zod'
import { CouponApplySchema, CouponInputSchema, CouponUpdateSchema } from '@/lib/validator'
import { revalidatePath } from 'next/cache'

export async function getCoupons(): Promise<ICoupon[]> {
  try {
    await connectToDatabase()
    return await Coupon.find({}).sort({ createdAt: -1 })
  } catch (error) {
    console.error('Get coupons error:', error)
    return []
  }
}

export async function getCouponById(id: string): Promise<ICoupon | null> {
  try {
    await connectToDatabase()
    return await Coupon.findById(id)
  } catch (error) {
    console.error('Get coupon by ID error:', error)
    return null
  }
}

export async function createCoupon(data: z.infer<typeof CouponInputSchema>): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'Admin') {
      return { success: false, message: 'Unauthorized' }
    }

    await connectToDatabase()

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: data.code.toUpperCase() })
    if (existingCoupon) {
      return { success: false, message: 'Coupon code already exists' }
    }

    const coupon = new Coupon({
      ...data,
      code: data.code.toUpperCase(),
    })

    await coupon.save()
    revalidatePath('/admin/coupons')
    
    return { success: true, message: 'Coupon created successfully' }
  } catch (error) {
    console.error('Create coupon error:', error)
    return { success: false, message: 'Failed to create coupon' }
  }
}

export async function updateCoupon(data: z.infer<typeof CouponUpdateSchema>): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'Admin') {
      return { success: false, message: 'Unauthorized' }
    }

    await connectToDatabase()

    const coupon = await Coupon.findById(data._id)
    if (!coupon) {
      return { success: false, message: 'Coupon not found' }
    }

    // Check if new code conflicts with existing coupons
    if (data.code !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ 
        code: data.code.toUpperCase(),
        _id: { $ne: data._id }
      })
      if (existingCoupon) {
        return { success: false, message: 'Coupon code already exists' }
      }
    }

    Object.assign(coupon, {
      ...data,
      code: data.code.toUpperCase(),
    })

    await coupon.save()
    revalidatePath('/admin/coupons')
    
    return { success: true, message: 'Coupon updated successfully' }
  } catch (error) {
    console.error('Update coupon error:', error)
    return { success: false, message: 'Failed to update coupon' }
  }
}

export async function deleteCoupon(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'Admin') {
      return { success: false, message: 'Unauthorized' }
    }

    await connectToDatabase()

    const coupon = await Coupon.findById(id)
    if (!coupon) {
      return { success: false, message: 'Coupon not found' }
    }

    await Coupon.findByIdAndDelete(id)
    revalidatePath('/admin/coupons')
    
    return { success: true, message: 'Coupon deleted successfully' }
  } catch (error) {
    console.error('Delete coupon error:', error)
    return { success: false, message: 'Failed to delete coupon' }
  }
}

export async function applyCoupon(code: string, orderAmount: number, userId?: string): Promise<{
  success: boolean
  discount: number
  message: string
  coupon?: ICoupon
}> {
  try {
    await connectToDatabase()

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    })

    if (!coupon) {
      return { success: false, discount: 0, message: 'Invalid or expired coupon code' }
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { success: false, discount: 0, message: 'Coupon usage limit reached' }
    }

    // Check minimum amount
    if (coupon.minimumAmount && orderAmount < coupon.minimumAmount) {
      return { 
        success: false, 
        discount: 0, 
        message: `Minimum order amount of $${coupon.minimumAmount} required` 
      }
    }

    // Calculate discount
    let discount = 0
    if (coupon.type === 'percentage') {
      discount = (orderAmount * coupon.value) / 100
      // Apply maximum discount limit if set
      if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
        discount = coupon.maximumDiscount
      }
    } else {
      discount = coupon.value
      if (discount > orderAmount) {
        discount = orderAmount
      }
    }

    return { 
      success: true, 
      discount, 
      message: `Coupon applied successfully! You saved $${discount.toFixed(2)}`,
      coupon
    }
  } catch (error) {
    console.error('Apply coupon error:', error)
    return { success: false, discount: 0, message: 'Failed to apply coupon' }
  }
}

export async function validateCoupon(code: string): Promise<{
  valid: boolean
  coupon?: ICoupon
  message: string
}> {
  try {
    await connectToDatabase()

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    })

    if (!coupon) {
      return { valid: false, message: 'Invalid or expired coupon code' }
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, message: 'Coupon usage limit reached' }
    }

    return { 
      valid: true, 
      coupon,
      message: 'Coupon is valid' 
    }
  } catch (error) {
    console.error('Validate coupon error:', error)
    return { valid: false, message: 'Failed to validate coupon' }
  }
}
