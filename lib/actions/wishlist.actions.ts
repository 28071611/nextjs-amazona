'use server'

import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import Wishlist, { IWishlist } from '@/lib/db/models/wishlist.model'
import Product from '@/lib/db/models/product.model'
import { revalidatePath } from 'next/cache'

export async function getWishlist(): Promise<IWishlist | null> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return null
    }

    await connectToDatabase()
    
    const wishlist = await Wishlist.findOne({ user: session.user.id })
      .populate({
        path: 'items.product._id',
        model: Product,
        select: '_id name slug image price category brand countInStock isPublished'
      })

    return wishlist
  } catch (error) {
    console.error('Get wishlist error:', error)
    return null
  }
}

export async function addToWishlist(productId: string): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to add items to wishlist' }
    }

    await connectToDatabase()

    // Check if product exists
    const product = await Product.findById(productId)
    if (!product) {
      return { success: false, message: 'Product not found' }
    }

    // Get or create wishlist
    let wishlist = await Wishlist.findOne({ user: session.user.id })
    
    if (!wishlist) {
      wishlist = new Wishlist({
        user: session.user.id,
        items: []
      })
    }

    // Check if item already exists in wishlist
    const existingItemIndex = wishlist.items.findIndex(
      item => item.product._id.toString() === productId
    )

    if (existingItemIndex > -1) {
      return { success: false, message: 'Item already in wishlist' }
    }

    // Add item to wishlist
    wishlist.items.push({
      product: {
        _id: product._id.toString(),
        name: product.name,
        slug: product.slug,
        image: product.images[0] || '',
        price: product.price,
        category: product.category,
        brand: product.brand,
      },
      addedAt: new Date(),
    })

    await wishlist.save()
    revalidatePath('/wishlist')
    
    return { success: true, message: 'Item added to wishlist' }
  } catch (error) {
    console.error('Add to wishlist error:', error)
    return { success: false, message: 'Failed to add item to wishlist' }
  }
}

export async function removeFromWishlist(productId: string): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to remove items from wishlist' }
    }

    await connectToDatabase()

    const wishlist = await Wishlist.findOne({ user: session.user.id })
    if (!wishlist) {
      return { success: false, message: 'Wishlist not found' }
    }

    // Remove item from wishlist
    wishlist.items = wishlist.items.filter(
      item => item.product._id.toString() !== productId
    )

    await wishlist.save()
    revalidatePath('/wishlist')
    
    return { success: true, message: 'Item removed from wishlist' }
  } catch (error) {
    console.error('Remove from wishlist error:', error)
    return { success: false, message: 'Failed to remove item from wishlist' }
  }
}

export async function clearWishlist(): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to clear wishlist' }
    }

    await connectToDatabase()

    const wishlist = await Wishlist.findOne({ user: session.user.id })
    if (!wishlist) {
      return { success: false, message: 'Wishlist not found' }
    }

    wishlist.items = []
    await wishlist.save()
    revalidatePath('/wishlist')
    
    return { success: true, message: 'Wishlist cleared' }
  } catch (error) {
    console.error('Clear wishlist error:', error)
    return { success: false, message: 'Failed to clear wishlist' }
  }
}

export async function isInWishlist(productId: string): Promise<boolean> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return false
    }

    await connectToDatabase()

    const wishlist = await Wishlist.findOne({ 
      user: session.user.id,
      'items.product._id': productId 
    })

    return !!wishlist
  } catch (error) {
    console.error('Check wishlist error:', error)
    return false
  }
}
