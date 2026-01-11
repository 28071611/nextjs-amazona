import mongoose from 'mongoose'

const globalWithMongoose = global as typeof globalThis & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mongoose?: any
}

const cached = globalWithMongoose.mongoose || { conn: null, promise: null }

globalWithMongoose.mongoose = cached

export const connectToDatabase = async (
  MONGODB_URI = process.env.MONGODB_URI
) => {
  if (cached.conn) return cached.conn

  if (!MONGODB_URI) throw new Error('MONGODB_URI is missing')

  cached.promise = cached.promise || mongoose.connect(MONGODB_URI)

  cached.conn = await cached.promise

  return cached.conn
}
