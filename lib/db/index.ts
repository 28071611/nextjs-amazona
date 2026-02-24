import mongoose from 'mongoose'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cached = (global as any).mongoose || { conn: null, promise: null }

export const connectToDatabase = async (
  MONGODB_URI = process.env.MONGODB_URI
) => {
  if (cached.conn) return cached.conn

  if (!MONGODB_URI) throw new Error('MONGODB_URI is missing')

  cached.promise = cached.promise || mongoose.connect(MONGODB_URI, {
    dbName: 'nextjs-amazona',
    bufferCommands: false,
  })

  try {
    cached.conn = await cached.promise
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error)
    throw error
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).mongoose = cached
  return cached.conn
}
