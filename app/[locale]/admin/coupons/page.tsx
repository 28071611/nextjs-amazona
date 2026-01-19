import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import CouponList from './coupon-list'

export const metadata: Metadata = {
  title: 'Coupons Management',
}

export default async function CouponsPage() {
  const session = await auth()
  
  if (!session?.user?.id || session.user.role !== 'Admin') {
    redirect('/sign-in')
  }

  return <CouponList />
}
