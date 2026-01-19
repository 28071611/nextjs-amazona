'use server'

import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import User, { IUser } from '@/lib/db/models/user.model'
import mongoose from 'mongoose'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

interface AddressInput {
  fullName: string
  street: string
  city: string
  province: string
  postalCode: string
  country: string
  phone: string
  isDefault: boolean
}

export async function getUserAddresses(): Promise<IUser | null> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return null
    }

    await connectToDatabase()
    const user = await User.findById(session.user.id)
    return user
  } catch (error) {
    console.error('Get user addresses error:', error)
    return null
  }
}

export async function addAddress(addressData: AddressInput): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: 'Unauthorized' }
    }

    await connectToDatabase()
    const user = await User.findById(session.user.id)
    
    if (!user) {
      return { success: false, message: 'User not found' }
    }

    // If setting as default, unset all other addresses
    if (addressData.isDefault) {
      user.addresses = (user.addresses || []).map(addr => ({
        ...addr,
        isDefault: false
      }))
    }

    if (!user.addresses) {
      user.addresses = []
    }
    
    user.addresses.push({
      _id: new mongoose.Types.ObjectId().toString(),
      fullName: addressData.fullName,
      street: addressData.street,
      city: addressData.city,
      province: addressData.province,
      postalCode: addressData.postalCode,
      country: addressData.country,
      phone: addressData.phone,
      isDefault: addressData.isDefault,
    })

    await user.save()
    revalidatePath('/account/addresses')
    
    return { success: true, message: 'Address added successfully' }
  } catch (error) {
    console.error('Add address error:', error)
    return { success: false, message: 'Failed to add address' }
  }
}

export async function updateAddress(addressId: string, addressData: AddressInput): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: 'Unauthorized' }
    }

    await connectToDatabase()
    const user = await User.findById(session.user.id)
    
    if (!user) {
      return { success: false, message: 'User not found' }
    }

    const addressIndex = (user.addresses || []).findIndex(addr => addr._id.toString() === addressId)
    if (addressIndex === -1) {
      return { success: false, message: 'Address not found' }
    }

    // If setting as default, unset all other addresses
    if (addressData.isDefault) {
      user.addresses = (user.addresses || []).map((addr, index) => ({
        ...addr,
        isDefault: index === addressIndex
      }))
    } else {
      if (!user.addresses) user.addresses = []
      user.addresses[addressIndex] = {
        ...user.addresses[addressIndex],
        ...addressData,
      }
    }

    await user.save()
    revalidatePath('/account/addresses')
    
    return { success: true, message: 'Address updated successfully' }
  } catch (error) {
    console.error('Update address error:', error)
    return { success: false, message: 'Failed to update address' }
  }
}

export async function deleteAddress(addressId: string): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: 'Unauthorized' }
    }

    await connectToDatabase()
    const user = await User.findById(session.user.id)
    
    if (!user) {
      return { success: false, message: 'User not found' }
    }

    const addressIndex = (user.addresses || []).findIndex(addr => addr._id.toString() === addressId)
    if (addressIndex === -1) {
      return { success: false, message: 'Address not found' }
    }

    const isDefaultAddress = user.addresses?.[addressIndex]?.isDefault
    
    // Remove the address
    if (!user.addresses) user.addresses = []
    user.addresses.splice(addressIndex, 1)
    
    // If we deleted the default address, set the first remaining address as default
    if (isDefaultAddress && user.addresses.length > 0) {
      user.addresses[0].isDefault = true
    }

    await user.save()
    revalidatePath('/account/addresses')
    
    return { success: true, message: 'Address deleted successfully' }
  } catch (error) {
    console.error('Delete address error:', error)
    return { success: false, message: 'Failed to delete address' }
  }
}

export async function setDefaultAddress(addressId: string): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: 'Unauthorized' }
    }

    await connectToDatabase()
    const user = await User.findById(session.user.id)
    
    if (!user) {
      return { success: false, message: 'User not found' }
    }

    // Unset all addresses as default
    user.addresses = (user.addresses || []).map(addr => ({
      ...addr,
      isDefault: false
    }))

    // Set the selected address as default
    const addressIndex = (user.addresses || []).findIndex(addr => addr._id.toString() === addressId)
    if (addressIndex === -1) {
      return { success: false, message: 'Address not found' }
    }

    user.addresses[addressIndex].isDefault = true

    await user.save()
    revalidatePath('/account/addresses')
    
    return { success: true, message: 'Default address updated successfully' }
  } catch (error) {
    console.error('Set default address error:', error)
    return { success: false, message: 'Failed to set default address' }
  }
}
