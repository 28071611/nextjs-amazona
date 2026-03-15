import React from 'react'

import Chatbot from '@/components/shared/chatbot'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='flex flex-col min-h-screen'>
      <main className='flex-1 flex flex-col p-4'>{children}</main>
      <Chatbot />
    </div>
  )
}
