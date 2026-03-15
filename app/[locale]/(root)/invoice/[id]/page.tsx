import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import InvoiceDisplay from '@/components/shared/order/invoice-display'
import { auth } from '@/auth'
import { Suspense } from 'react'

interface InvoicePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata(props: InvoicePageProps): Promise<Metadata> {
  const params = await props.params
  return {
    title: `Invoice #${params.id.slice(-6)} - Amazona`,
    description: 'View and download your order invoice',
  }
}

export default async function InvoicePage(props: InvoicePageProps) {
  const session = await auth()
  if (!session) {
    notFound()
  }

  const params = await props.params
  
  return (
    <div className="container-elite py-8">
      <Suspense fallback={<div>Loading invoice...</div>}>
        <InvoiceDisplay orderId={params.id} />
      </Suspense>
    </div>
  )
}
