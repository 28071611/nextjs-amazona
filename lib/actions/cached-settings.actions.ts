'use server'

import { connectToDatabase } from '@/lib/db'
import { getSetting } from './setting.actions'
import { RedisCache, CACHE_KEYS, CACHE_TTL } from '@/lib/redis'
import { revalidatePath } from 'next/cache'
import { formatError } from '../utils'

export async function getCachedSettings() {
  try {
    // Try to get from cache first
    const cachedSettings = await RedisCache.get(CACHE_KEYS.SETTINGS)
    
    if (cachedSettings) {
      console.log('Settings retrieved from cache')
      return cachedSettings
    }

    // If not in cache, fetch from database and cache it
    const settings = await getSetting()
    
    // Cache the settings
    await RedisCache.set(CACHE_KEYS.SETTINGS, settings, CACHE_TTL.SETTINGS)
    console.log('Settings cached successfully')

    return settings
  } catch (error) {
    console.error('Get cached settings error:', error)
    return null
  }
}

export async function invalidateSettingsCache(): Promise<void> {
  try {
    await RedisCache.del(CACHE_KEYS.SETTINGS)
    console.log('Settings cache invalidated')
  } catch (error) {
    console.error('Invalidate settings cache error:', error)
  }
}
