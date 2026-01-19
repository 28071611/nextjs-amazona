import { Document, Model, model, models, Schema } from 'mongoose'

export interface ICoupon extends Document {
  _id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minimumAmount?: number
  maximumDiscount?: number
  usageLimit?: number
  usedCount: number
  isActive: boolean
  startDate: Date
  endDate: Date
  applicableProducts?: string[]
  applicableCategories?: string[]
  userUsageLimit?: number
  createdAt: Date
  updatedAt: Date
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['percentage', 'fixed'],
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minimumAmount: {
      type: Number,
      min: 0,
    },
    maximumDiscount: {
      type: Number,
      min: 0,
    },
    usageLimit: {
      type: Number,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    applicableProducts: [{
      type: String,
    }],
    applicableCategories: [{
      type: String,
    }],
    userUsageLimit: {
      type: Number,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
)

// Index for faster lookups
couponSchema.index({ code: 1 })
couponSchema.index({ isActive: 1, startDate: 1, endDate: 1 })

const Coupon =
  (models.Coupon as Model<ICoupon>) ||
  model<ICoupon>('Coupon', couponSchema)

export default Coupon
