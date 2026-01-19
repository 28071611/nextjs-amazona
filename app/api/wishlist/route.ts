import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getWishlist } from '@/lib/actions/wishlist.actions'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const wishlist = await getWishlist()
    
    return NextResponse.json(wishlist)
  } catch (error) {
    console.error('Get wishlist API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
