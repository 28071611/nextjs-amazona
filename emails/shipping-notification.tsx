import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Tailwind,
    Text,
    Row,
    Column,
} from '@react-email/components'
import { IOrder } from '@/lib/db/models/order.model'
import { getSetting } from '@/lib/actions/setting.actions'
import { formatCurrency } from '@/lib/utils'

type Props = { order: IOrder; newStatus: string; note?: string }

const STATUS_MESSAGES: Record<string, string> = {
    Packed: 'Your order has been packed and is ready for dispatch.',
    Shipped: 'Great news! Your order is on its way.',
    'Out for Delivery': 'Your order is out for delivery today!',
    Delivered: 'Your order has been delivered. Enjoy!',
    Cancelled: 'Your order has been cancelled.',
}

export default async function ShippingNotificationEmail({ order, newStatus, note }: Props) {
    const { site } = await getSetting()
    const message = STATUS_MESSAGES[newStatus] ?? `Your order status has been updated to: ${newStatus}`
    const dateFormatter = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' })

    return (
        <Html>
            <Preview>{message}</Preview>
            <Tailwind>
                <Head />
                <Body className='font-sans bg-white'>
                    <Container className='max-w-xl'>
                        <Heading className='text-xl font-bold'>{site.name} — Order Update</Heading>
                        <Text className='text-gray-600'>
                            Hi {(order.user as { name: string }).name}, here&apos;s an update on your order.
                        </Text>

                        {/* Status Banner */}
                        <Section className='bg-blue-50 border border-blue-200 rounded-lg p-4 my-4'>
                            <Text className='text-blue-800 font-semibold text-base mb-0'>
                                Status: {newStatus}
                            </Text>
                            <Text className='text-blue-700 mt-1 mb-0'>{message}</Text>
                            {note && <Text className='text-blue-600 text-sm mt-1 mb-0'>Note: {note}</Text>}
                            <Text className='text-gray-400 text-xs mt-2 mb-0'>
                                Updated: {dateFormatter.format(new Date())}
                            </Text>
                        </Section>

                        {/* Order Info */}
                        <Section className='border border-gray-200 rounded-lg p-4 my-4'>
                            <Row>
                                <Column>
                                    <Text className='text-gray-500 text-sm mb-0'>Order ID</Text>
                                    <Text className='mt-0 font-mono text-sm'>{order._id.toString()}</Text>
                                </Column>
                                <Column>
                                    <Text className='text-gray-500 text-sm mb-0'>Total</Text>
                                    <Text className='mt-0'>{formatCurrency(order.totalPrice)}</Text>
                                </Column>
                            </Row>
                            <Row>
                                <Column>
                                    <Text className='text-gray-500 text-sm mb-0'>Delivery Address</Text>
                                    <Text className='mt-0 text-sm'>
                                        {order.shippingAddress.fullName}, {order.shippingAddress.street},{' '}
                                        {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                                    </Text>
                                </Column>
                            </Row>
                        </Section>

                        <Text className='text-gray-500 text-sm'>
                            You can track your order at{' '}
                            <a href={`${site.url}/account/orders/${order._id}`} className='text-blue-600'>
                                {site.url}/account/orders/{order._id.toString()}
                            </a>
                        </Text>
                        <Text className='text-gray-400 text-xs mt-8'>
                            © {new Date().getFullYear()} {site.name}. All rights reserved.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}
