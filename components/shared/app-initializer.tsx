import React, { useEffect, useState } from 'react'
import { ClientSetting } from '@/types'

export default function AppInitializer({
  setting,
  children,
}: {
  setting: ClientSetting
  children: React.ReactNode
}) {
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    setRendered(true)
  }, [setting])

  if (!rendered) {
    // Initialize settings here if needed
    console.log('AppInitializer: Initializing with settings', setting)
  }

  return children
}
