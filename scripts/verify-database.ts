import { connectToDatabase } from '@/lib/db'
import User from '@/lib/db/models/user.model'

async function verifyDatabase() {
    try {
        console.log('🚀 Starting Database Verification...')
        
        // Test database connection
        console.log('📊 Testing database connection...')
        await connectToDatabase()
        console.log('✅ Database connection successful!')
        
        // Test all models
        console.log('🔍 Testing all database models...')
        
        const userCount = await User.countDocuments()
        console.log(`✅ User model working: ${userCount} users found`)
        
        console.log('🎉 Database verification completed!')
        console.log('📊 Summary:')
        console.log(`   - Database: Connected`)
        console.log(`   - User Model: Working`)
        console.log(`   - Collections: ${userCount} users`)
        
        process.exit(0)
    } catch (error) {
        console.error('❌ Database verification failed:', error)
        process.exit(1)
    }
}

verifyDatabase()
