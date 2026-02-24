'use server'

import bcrypt from 'bcryptjs'
import { auth, signIn, signOut } from '@/auth'
import { IUserName, IUserSignIn, IUserSignUp } from '@/types'
import {
  UserEmailSchema,
  UserPasswordSchema,
  UserSignUpSchema,
  UserUpdateSchema,
} from '../validator'
import { connectToDatabase } from '../db'
import User, { IUser } from '../db/models/user.model'
import { formatError } from '../utils'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getSetting } from './setting.actions'

// CREATE
export async function registerUser(userSignUp: IUserSignUp) {
  try {
    console.log('🧪 Starting user registration:', userSignUp.email);

    // Validate input
    const user = await UserSignUpSchema.parseAsync({
      name: userSignUp.name,
      email: userSignUp.email,
      password: userSignUp.password,
      confirmPassword: userSignUp.confirmPassword,
      isSeller: userSignUp.isSeller,
    })
    console.log('✅ Input validation passed');

    await connectToDatabase()
    console.log('✅ Database connected');

    // Check if user already exists
    const existingUser = await User.findOne({ email: user.email })
    if (existingUser) {
      console.log('❌ User already exists:', user.email);
      return { success: false, error: 'User already exists with this email' }
    }
    console.log('✅ No duplicate user found');

    // Create user without confirmPassword field
    const { confirmPassword, ...userData } = user
    const hashedPassword = await bcrypt.hash(user.password, 5)
    console.log('✅ Password hashed');

    const newUser = await User.create({
      ...userData,
      password: hashedPassword,
      role: user.isSeller ? 'Seller' : 'User',
      emailVerified: false,
    })
    console.log('✅ User created in database:', newUser._id);

    return { success: true, message: 'User created successfully' }
  } catch (error) {
    console.error('❌ Registration error:', error);
    return { success: false, error: formatError(error) }
  }
}

// DELETE

export async function deleteUser(id: string) {
  try {
    await connectToDatabase()
    const res = await User.findByIdAndDelete(id)
    if (!res) throw new Error('Use not found')
    revalidatePath('/admin/users')
    return {
      success: true,
      message: 'User deleted successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
// UPDATE

export async function updateUser(user: z.infer<typeof UserUpdateSchema>) {
  try {
    await connectToDatabase()
    const dbUser = await User.findById(user._id)
    if (!dbUser) throw new Error('User not found')
    dbUser.set('name', user.name)
    dbUser.set('email', user.email)
    dbUser.set('role', user.role)
    const updatedUser = await dbUser.save()
    revalidatePath('/admin/users')
    return {
      success: true,
      message: 'User updated successfully',
      data: JSON.parse(JSON.stringify(updatedUser)),
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
export async function updateUserName(user: IUserName) {
  try {
    await connectToDatabase()
    const session = await auth()
    const currentUser = await User.findById(session?.user?.id)
    if (!currentUser) throw new Error('User not found')
    currentUser.set('name', user.name)
    const updatedUser = await currentUser.save()
    return {
      success: true,
      message: 'User updated successfully',
      data: JSON.parse(JSON.stringify(updatedUser)),
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function updateUserAddress(data: any) {
  try {
    await connectToDatabase()
    const session = await auth()
    const currentUser = await User.findById(session?.user?.id)
    if (!currentUser) throw new Error('User not found')

    currentUser.address = data
    const updatedUser = await currentUser.save()
    return {
      success: true,
      message: 'User address updated successfully',
      data: JSON.parse(JSON.stringify(updatedUser)),
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function updateUserEmail(user: z.infer<typeof UserEmailSchema>) {
  try {
    await connectToDatabase()
    const session = await auth()
    const currentUser = await User.findById(session?.user?.id)
    if (!currentUser) throw new Error('User not found')
    currentUser.set('email', user.email)
    const updatedUser = await currentUser.save()
    return {
      success: true,
      message: 'User updated successfully',
      data: JSON.parse(JSON.stringify(updatedUser)),
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function updateUserPassword(
  user: z.infer<typeof UserPasswordSchema>
) {
  try {
    await connectToDatabase()
    const session = await auth()
    const currentUser = await User.findById(session?.user?.id)
    if (!currentUser) throw new Error('User not found')
    currentUser.set('password', await bcrypt.hash(user.password, 5))
    const updatedUser = await currentUser.save()
    return {
      success: true,
      message: 'User updated successfully',
      data: JSON.parse(JSON.stringify(updatedUser)),
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function signInWithCredentials(user: IUserSignIn) {
  try {
    const result = await signIn('credentials', {
      email: user.email,
      password: user.password,
      redirect: false,
    })
    return result
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}
export const SignInWithGoogle = async () => {
  await signIn('google')
}
export const SignOut = async () => {
  const redirectTo = await signOut({ redirect: false })
  redirect(redirectTo.redirect)
}

// GET
export async function getAllUsers({
  limit,
  page,
}: {
  limit?: number
  page: number
}) {
  const {
    common: { pageSize },
  } = await getSetting()
  limit = limit || pageSize
  await connectToDatabase()

  const skipAmount = (Number(page) - 1) * (limit || pageSize)
  const users = await User.find()
    .sort({ createdAt: 'desc' })
    .skip(skipAmount)
    .limit(limit || pageSize)
  const usersCount = await User.countDocuments()
  return {
    data: JSON.parse(JSON.stringify(users)) as IUser[],
    totalPages: Math.ceil(usersCount / (limit || pageSize)),
  }
}

export async function getUserById(userId: string) {
  await connectToDatabase()
  const user = await User.findById(userId)
  if (!user) throw new Error('User not found')
  return JSON.parse(JSON.stringify(user)) as IUser
}
