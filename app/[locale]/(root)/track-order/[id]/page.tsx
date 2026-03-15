import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import OrderTracking from '@/components/shared/order/order-tracking-enhanced'
import { auth } from '@/auth'
import { Suspense } from 'react'

interface OrderTrackingPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(props: OrderTrackingPageProps): Promise<Metadata> {
  const params = await props.params
  return {
    title: `Track Order #${params.id.slice(-6)} - Amazona`,
    description: 'Track your order status and delivery timeline',
  }
}

export default async function OrderTrackingPage(props: OrderTrackingPageProps) {
  const session = await auth()
  if (!session) {
    notFound()
  }

  const params = await props.params
  const searchParams = await props.searchParams
  
  return (
    <div className="container-elite py-8">
      <Suspense fallback={<div>Loading tracking information...</div>}>
        <OrderTracking
          orderId={params.id}
          currentStatus={searchParams.status as string}
          estimatedDelivery={searchParams.estimated as string}
        />
      </Suspense>
    </div>
  )
}
