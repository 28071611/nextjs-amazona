import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from './db'
import User from './db/models/user.model'

export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex')
}

export const generateResetTokenExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
}

export const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export const createPasswordResetToken = async (email: string) => {
  await connectToDatabase()
  
  const user = await User.findOne({ email })
  if (!user) {
    throw new Error('No user found with that email')
  }

  const resetToken = generateResetToken()
  const resetTokenExpiry = generateResetTokenExpiry()
  
  user.resetPasswordToken = hashToken(resetToken)
  user.resetPasswordExpires = resetTokenExpiry
  
  await user.save()
  
  return resetToken // Return unhashed token for email
}

export const verifyResetToken = async (token: string) => {
  await connectToDatabase()
  
  const hashedToken = hashToken(token)
  
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() }
  })
  
  if (!user) {
    throw new Error('Reset token is invalid or has expired')
  }
  
  return user
}

export const resetUserPassword = async (token: string, newPassword: string) => {
  const user = await verifyResetToken(token)
  
  const hashedPassword = await bcrypt.hash(newPassword, 10)
  
  user.set('password', hashedPassword)
  user.set('resetPasswordToken', undefined)
  user.set('resetPasswordExpires', undefined)
  
  await user.save()
  
  return user
}
