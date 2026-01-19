import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getCouponById } from '@/lib/actions/coupon.actions'
import CouponForm from '../../coupon-form'

export const metadata: Metadata = {
  title: 'Edit Coupon',
}

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  
  if (!session?.user?.id || session.user.role !== 'Admin') {
    redirect('/sign-in')
  }

  const { id } = await params
  const coupon = await getCouponById(id)

  if (!coupon) {
    redirect('/admin/coupons')
  }

  return <CouponForm coupon={coupon} />
}
