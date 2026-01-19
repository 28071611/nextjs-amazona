import { IUserInput } from '@/types'
import { Document, Model, model, models, Schema } from 'mongoose'

export interface IUser extends Document {
  _id: string
  email: string
  name: string
  role: string
  password?: string
  image?: string
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
  address?: {
    fullName: string
    street: string
    city: string
    province: string
    postalCode: string
    country: string
    phone: string
  }
  addresses?: {
    _id: string
    fullName: string
    street: string
    city: string
    province: string
    postalCode: string
    country: string
    phone: string
    isDefault: boolean
  }[]
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  emailVerificationToken?: string
  emailVerificationExpires?: Date
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, required: true, default: 'User' },
    password: { type: String },
    image: { type: String },
    emailVerified: { type: Boolean, default: false },
    address: {
      fullName: { type: String },
      street: { type: String },
      city: { type: String },
      province: { type: String },
      postalCode: { type: String },
      country: { type: String },
      phone: { type: String },
    },
    addresses: [{
      fullName: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      province: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
      isDefault: { type: Boolean, required: true, default: false },
    }],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
  },
  {
    timestamps: true,
  }
)

const User = (models.User as Model<IUser>) || model<IUser>('User', userSchema)

export default User
