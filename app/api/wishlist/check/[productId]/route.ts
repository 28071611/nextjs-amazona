import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isInWishlist } from '@/lib/actions/wishlist.actions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ isInWishlist: false })
    }

    const { productId } = await params
    const inWishlist = await isInWishlist(productId)
    
    return NextResponse.json({ isInWishlist: inWishlist })
  } catch (error) {
    console.error('Check wishlist API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
