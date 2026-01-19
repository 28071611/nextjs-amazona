import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { removeFromWishlist } from '@/lib/actions/wishlist.actions'
import { z } from 'zod'
import { WishlistItemSchema } from '@/lib/validator'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId } = WishlistItemSchema.parse(body)

    const result = await removeFromWishlist(productId)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ message: result.message })
  } catch (error) {
    console.error('Remove from wishlist API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
