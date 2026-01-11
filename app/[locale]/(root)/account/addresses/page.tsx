import { auth } from '@/auth'
import { Metadata } from 'next'
import AddressForm from './address-form'
import { redirect } from 'next/navigation'
import { getUserById } from '@/lib/actions/user.actions'

export const metadata: Metadata = {
    title: 'Address',
}

export default async function AddressPage() {
    const session = await auth()
    if (!session) {
        redirect('/sign-in')
    }

    const user = await getUserById(session.user.id!)

    return (
        <div className='space-y-4 max-w-lg mx-auto'>
            <h1 className='h2-bold'>Addresses</h1>
            <AddressForm user={user} />
        </div>
    )
}
