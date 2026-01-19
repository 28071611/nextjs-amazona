import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import CouponForm from '../coupon-form'

export const metadata: Metadata = {
  title: 'Create Coupon',
}

export default async function CreateCouponPage() {
  const session = await auth()
  
  if (!session?.user?.id || session.user.role !== 'Admin') {
    redirect('/sign-in')
  }

  return <CouponForm />
}
