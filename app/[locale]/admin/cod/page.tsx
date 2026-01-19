import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import CODManagementClient from './cod-management-client'

export const metadata: Metadata = {
  title: 'COD Management',
}

export default async function CODPage() {
  const session = await auth()
  
  if (!session?.user?.id || session.user.role !== 'Admin') {
    redirect('/sign-in')
  }

  return <CODManagementClient />
}
