import Redis from 'ioredis'

// Redis client configuration with error handling
let redis: Redis | null = null
let redisEnabled = false

try {
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB || '0'),
    maxRetriesPerRequest: 3,
    lazyConnect: true, // Don't connect immediately
  })

  redis.on('connect', () => {
    console.log('✅ Redis connected successfully')
    redisEnabled = true
  })

  redis.on('error', (err) => {
    console.log('⚠️ Redis connection failed, running without cache:', err.message)
    redisEnabled = false
  })

  redis.on('close', () => {
    console.log('🔌 Redis connection closed')
    redisEnabled = false
  })

} catch (error: any) {
  console.log('⚠️ Redis initialization failed, running without cache:', error.message)
  redisEnabled = false
}

// Cache TTL (time to live) in seconds
export const CACHE_TTL = {
  PRODUCTS: 3600, // 1 hour
  CATEGORIES: 7200, // 2 hours
  ORDERS: 1800, // 30 minutes
  USER_SESSIONS: 86400, // 24 hours
  SETTINGS: 3600, // 1 hour
  PRODUCT_DETAIL: 3600, // 1 hour
}

// Cache key prefixes
export const CACHE_KEYS = {
  PRODUCTS: 'products:',
  CATEGORIES: 'categories:',
  ORDERS: 'orders:',
  USER_SESSIONS: 'user_sessions:',
  SETTINGS: 'settings:',
  PRODUCT_DETAIL: 'product_detail:',
  USER_ADDRESSES: 'user_addresses:',
  WISHLIST: 'user_wishlist:',
}

// Redis utility functions
export class RedisCache {
  private static async getRedis(): Promise<Redis | null> {
    if (!redis || !redisEnabled) {
      return null
    }
    if (redis.status !== 'ready') {
      try {
        await redis.connect()
      } catch (error) {
        console.log('Redis connection failed:', error)
        return null
      }
    }
    return redis
  }

  static async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!redisEnabled) return
    
    try {
      const client = await this.getRedis()
      if (!client) return
      await client.setex(key, ttl || CACHE_TTL.PRODUCTS, JSON.stringify(value))
    } catch (error) {
      console.error('Redis set error:', error)
    }
  }

  static async get(key: string): Promise<any> {
    if (!redisEnabled) return null
    
    try {
      const client = await this.getRedis()
      if (!client) return null
      const value = await client.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Redis get error:', error)
      return null
    }
  }

  static async del(key: string): Promise<void> {
    if (!redisEnabled) return
    
    try {
      const client = await this.getRedis()
      if (!client) return
      await client.del(key)
    } catch (error) {
      console.error('Redis delete error:', error)
    }
  }

  static async delPattern(pattern: string): Promise<void> {
    if (!redisEnabled) return
    
    try {
      const client = await this.getRedis()
      if (!client) return
      const keys = await client.keys(pattern)
      if (keys.length > 0) {
        await client.del(...keys)
      }
    } catch (error) {
      console.error('Redis delete pattern error:', error)
    }
  }

  static async exists(key: string): Promise<boolean> {
    if (!redisEnabled) return false
    
    try {
      const client = await this.getRedis()
      if (!client) return false
      const result = await client.exists(key)
      return result === 1
    } catch (error) {
      console.error('Redis exists error:', error)
      return false
    }
  }

  static async increment(key: string, amount: number = 1): Promise<number> {
    if (!redisEnabled) return 0
    
    try {
      const client = await this.getRedis()
      if (!client) return 0
      const result = await client.incrby(key, amount)
      return result
    } catch (error) {
      console.error('Redis increment error:', error)
      return 0
    }
  }

  static async expire(key: string, ttl: number): Promise<void> {
    if (!redisEnabled) return
    
    try {
      const client = await this.getRedis()
      if (!client) return
      await client.expire(key, ttl)
    } catch (error) {
      console.error('Redis expire error:', error)
    }
  }
}

export default RedisCache
