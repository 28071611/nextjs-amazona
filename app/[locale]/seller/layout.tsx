import { auth } from '@/auth'
import Link from 'next/link'
import Image from 'next/image'
import Menu from '@/components/shared/header/menu'
import { redirect } from 'next/navigation'
import React from 'react'
import { Button } from '@/components/ui/button'
import { getSetting } from '@/lib/actions/setting.actions'
import { getLocale } from 'next-intl/server'

export default async function SellerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    if (!session?.user || session.user.role !== 'Seller') {
        redirect('/')
    }
    const { site } = await getSetting()
    const locale = await getLocale()

    return (
        <div className='flex flex-col min-h-screen'>
            <div className='bg-black text-white'>
                <div className='flex h-16 items-center px-4'>
                    <Link href='/'>
                        <Image
                            src='/icons/logo.svg'
                            width={48}
                            height={48}
                            alt={`${site.name} logo`}
                        />
                    </Link>
                    <div className='ml-6 flex space-x-4'>
                        <Link href={`/${locale}/seller/products`} className='hover:text-gray-300'>
                            Products
                        </Link>
                        <Button asChild variant="secondary" className="text-black">
                            <Link href={`/${locale}/seller/products/create`}>
                                Create Product
                            </Link>
                        </Button>
                        {/* Add more seller links here */}
                    </div>
                    <div className='ml-auto flex items-center space-x-4'>
                        <Menu forAdmin={false} />
                    </div>
                </div>
            </div>
            <div className='flex-1 p-6 bg-background text-foreground'>{children}</div>
        </div>
    )
}
