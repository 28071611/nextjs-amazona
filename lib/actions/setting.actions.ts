'use server'
import { ISettingInput } from '@/types'
import data from '../data'
import Setting from '../db/models/setting.model'
import { connectToDatabase } from '@/lib/db'
import { RedisCache, CACHE_KEYS, CACHE_TTL } from '@/lib/redis'
import { revalidatePath } from 'next/cache'
import { formatError } from '../utils'
import { cookies } from 'next/headers'

const globalForSettings = global as unknown as {
  cachedSettings: ISettingInput | null
}

export const getNoCachedSetting = async (): Promise<ISettingInput> => {
  await connectToDatabase()
  const setting = await Setting.findOne()
  return JSON.parse(JSON.stringify(setting)) as ISettingInput
}

export async function getSetting() {
  try {
    // Try to get from cache first
    const cachedSettings = await RedisCache.get(CACHE_KEYS.SETTINGS)
    
    if (cachedSettings) {
      console.log('Settings retrieved from cache')
      return cachedSettings
    }

    // If not in cache, fetch from database and cache it
    const settings = await getNoCachedSetting()
    
    // Cache the settings
    await RedisCache.set(CACHE_KEYS.SETTINGS, settings, CACHE_TTL.SETTINGS)
    console.log('Settings cached successfully')

    return settings
  } catch (error) {
    console.error('Get setting error:', error)
    return null
  }
}

export const updateSetting = async (newSetting: ISettingInput) => {
  try {
    await connectToDatabase()
    const updatedSetting = await Setting.findOneAndUpdate({}, newSetting, {
      upsert: true,
      new: true,
    }).lean()
    globalForSettings.cachedSettings = JSON.parse(
      JSON.stringify(updatedSetting)
    ) // Update the cache
    await RedisCache.del(CACHE_KEYS.SETTINGS)
    await RedisCache.set(CACHE_KEYS.SETTINGS, updatedSetting, CACHE_TTL.SETTINGS)
    console.log('Settings cached successfully')
    revalidatePath('/admin/settings')
    return {
      success: true,
      message: 'Setting updated successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// Server action to update the currency cookie
export const setCurrencyOnServer = async (newCurrency: string) => {
  'use server'
  const cookiesStore = await cookies()
  cookiesStore.set('currency', newCurrency)

  return {
    success: true,
    message: 'Currency updated successfully',
  }
}
