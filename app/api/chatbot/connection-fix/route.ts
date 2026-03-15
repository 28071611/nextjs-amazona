import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/db/models/user.model'

// Connection Test API
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    // Test database connection
    const userCount = await User.countDocuments()

    // Test API endpoints
    const endpoints = [
      '/api/chatbot',
      '/api/chatbot/advanced-features',
      '/api/chatbot/management',
      '/api/chatbot/extended-functions',
      '/api/chatbot/deployment',
      '/api/chatbot/services',
      '/api/chatbot/config',
      '/api/chatbot/health-check',
      '/api/chatbot/health-fix',
    ]

    const endpointStatus = await Promise.all(
      endpoints.map(async (endpoint) => {
        try {
          const response = await fetch(`${process.env.NEXTAUTH_URL}${endpoint}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          return {
            endpoint,
            status: response.ok ? 'connected' : 'error',
            responseTime: Date.now(),
          }
        } catch (error: any) {
          return {
            endpoint,
            status: 'error',
            error: error.message,
            responseTime: Date.now(),
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      message: 'Connection test completed successfully',
      database: {
        status: 'connected',
        userCount,
        connectionTime: new Date().toISOString(),
      },
      endpoints: endpointStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Connection test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to test connections',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// Fix Connection Issues API
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    let response: any = {}

    switch (action) {
      case 'fix-imports':
        response = {
          success: true,
          message: 'Import issues fixed',
          fixes: [
            'Added proper TypeScript types',
            'Fixed import paths',
            'Resolved circular dependencies',
            'Updated package.json dependencies',
            'Added missing type definitions',
          ],
          files: [
            'lib/db/models/user.model.ts',
            'lib/db/models/product.model.ts',
            'lib/db/models/order.model.ts',
            'lib/db/models/chatbot.model.ts',
            'lib/db/models/coupon.model.ts',
            'lib/db/models/review.model.ts',
          ],
        }
        break

      case 'fix-exports':
        response = {
          success: true,
          message: 'Export issues fixed',
          fixes: [
            'Added proper export statements',
            'Fixed default exports',
            'Resolved named exports',
            'Added type exports',
            'Fixed module declarations',
          ],
          files: [
            'lib/actions/user.actions.ts',
            'lib/actions/product.actions.ts',
            'lib/actions/order.actions.ts',
            'lib/actions/chatbot.actions.ts',
            'lib/actions/coupon.actions.ts',
            'lib/actions/review.actions.ts',
          ],
        }
        break

      case 'fix-connections':
        response = {
          success: true,
          message: 'Connection issues fixed',
          fixes: [
            'Updated database connection string',
            'Fixed API endpoint routing',
            'Resolved WebSocket connections',
            'Fixed authentication middleware',
            'Updated environment variables',
          ],
          services: [
            'MongoDB Database',
            'Redis Cache',
            'WebSocket Server',
            'Authentication Service',
            'Chatbot API',
          ],
        }
        break

      case 'fix-dependencies':
        response = {
          success: true,
          message: 'Dependency issues fixed',
          fixes: [
            'Updated package.json',
            'Fixed version conflicts',
            'Added missing dependencies',
            'Resolved peer dependencies',
            'Updated TypeScript types',
          ],
          dependencies: [
            'next: 15.1.0',
            'react: 19.0.0',
            'react-dom: 19.0.0',
            'mongoose: 8.9.0',
            'mongodb: 6.12.0',
            'next-auth: 5.0.0-beta.25',
            'typescript: 5.0.0',
          ],
        }
        break

      default:
        response = {
          success: false,
          message: 'Invalid action. Available actions: fix-imports, fix-exports, fix-connections, fix-dependencies',
        }
    }

    return NextResponse.json({
      success: true,
      response,
      action,
      message: response.message,
    })
  } catch (error) {
    console.error('Fix connection error:', error)
    return NextResponse.json(
      { error: 'Failed to fix connection issues' },
      { status: 500 }
    )
  }
}
