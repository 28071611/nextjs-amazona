import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import RefundManagementClient from './refund-management-client'

export const metadata: Metadata = {
  title: 'Refund Management',
}

export default async function RefundsPage() {
  const session = await auth()
  
  if (!session?.user?.id || session.user.role !== 'Admin') {
    redirect('/sign-in')
  }

  return <RefundManagementClient />
}
