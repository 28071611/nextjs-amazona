import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { invalidateProductCache } from '@/lib/actions/cached-product.actions'
import { invalidateSettingsCache } from '@/lib/actions/cached-settings.actions'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { cacheType } = body

    switch (cacheType) {
      case 'products':
        await invalidateProductCache()
        break
      case 'settings':
        await invalidateSettingsCache()
        break
      case 'all':
        await invalidateProductCache()
        await invalidateSettingsCache()
        break
      default:
        return NextResponse.json(
          { error: 'Invalid cache type' },
          { status: 400 }
        )
    }

    return NextResponse.json({ message: `${cacheType} cache invalidated successfully` })
  } catch (error) {
    console.error('Invalidate cache API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
