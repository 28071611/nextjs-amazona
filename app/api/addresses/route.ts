import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getUserAddresses } from '@/lib/actions/address.actions'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await getUserAddresses()
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      addresses: user.addresses || [],
    })
  } catch (error) {
    console.error('Get addresses API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
