import { connectToDatabase } from '@/lib/db'
import User from '@/lib/db/models/user.model'
import Product from '@/lib/db/models/product.model'
import Order from '@/lib/db/models/order.model'
import { ChatMessage } from '@/lib/db/models/chatbot.model'
import Coupon from '@/lib/db/models/coupon.model'
import Review from '@/lib/db/models/review.model'

async function verifyProject() {
    try {
        console.log('🚀 Starting Project Verification...')

        // Test database connection
        console.log('📊 Testing database connection...')
        await connectToDatabase()
        console.log('✅ Database connection successful!')

        // Test all models
        console.log('🔍 Testing all database models...')

        const userCount = await User.countDocuments()
        console.log(`✅ User model working: ${userCount} users found`)

        const productCount = await Product.countDocuments()
        console.log(`✅ Product model working: ${productCount} products found`)

        const orderCount = await Order.countDocuments()
        console.log(`✅ Order model working: ${orderCount} orders found`)

        const chatMessageCount = await ChatMessage.countDocuments()
        console.log(`✅ ChatMessage model working: ${chatMessageCount} chat messages found`)

        const couponCount = await Coupon.countDocuments()
        console.log(`✅ Coupon model working: ${couponCount} coupons found`)

        const reviewCount = await Review.countDocuments()
        console.log(`✅ Review model working: ${reviewCount} reviews found`)

        // Test API endpoints
        console.log('🔗 Testing API endpoints...')
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
            '/api/chatbot/connection-fix',
            '/api/chatbot/project-check',
        ]

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(`http://localhost:3000${endpoint}`)
                if (response.ok) {
                    console.log(`✅ ${endpoint} - Working`)
                } else {
                    console.log(`❌ ${endpoint} - Error: ${response.status}`)
                }
            } catch (error: any) {
                console.log(`❌ ${endpoint} - Error: ${error.message}`)
            }
        }

        // Check environment variables
        console.log('🔧 Checking environment variables...')
        const requiredEnvVars = [
            'MONGODB_URI',
            'NEXTAUTH_URL',
            'NEXTAUTH_SECRET',
            'GOOGLE_CLIENT_ID',
            'GOOGLE_CLIENT_SECRET',
            'RAZORPAY_KEY_ID',
            'RAZORPAY_KEY_SECRET',
            'RESEND_API_KEY',
            'UPLOADTHING_SECRET',
            'UPLOADTHING_APP_ID',
        ]

        let missingEnvVars = []
        for (const envVar of requiredEnvVars) {
            if (!process.env[envVar]) {
                missingEnvVars.push(envVar)
            }
        }

        if (missingEnvVars.length === 0) {
            console.log('✅ All required environment variables are set')
        } else {
            console.log(`❌ Missing environment variables: ${missingEnvVars.join(', ')}`)
        }

        console.log('🎉 Project verification completed!')
        console.log('📊 Summary:')
        console.log(`   - Database: Connected`)
        console.log(`   - Models: All working`)
        console.log(`   - API Endpoints: ${endpoints.length} total`)
        console.log(`   - Environment: ${missingEnvVars.length === 0 ? 'Complete' : 'Missing variables'}`)

        process.exit(0)
    } catch (error) {
        console.error('❌ Project verification failed:', error)
        process.exit(1)
    }
}

verifyProject()
