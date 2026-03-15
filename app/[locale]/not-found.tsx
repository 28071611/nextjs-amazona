'use client'

import React from 'react'
import { Link } from '@/i18n'
import { useTranslations } from 'next-intl'

export default function NotFound() {
    const t = useTranslations('Error')
    return (
        <div className='flex flex-col items-center justify-center min-h-screen bg-background text-foreground'>
            <div className='p-8 rounded-lg border border-border text-center max-w-md'>
                <h1 className='text-5xl font-bold mb-4 text-primary'>404</h1>
                <h2 className='text-2xl font-semibold mb-4'>Page Not Found</h2>
                <p className='text-muted-foreground mb-6'>
                    The page you are looking for does not exist or has been moved.
                </p>
                <Link
                    href='/'
                    className='inline-block px-6 py-3 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity font-medium'
                >
                    ← Back to Home
                </Link>
            </div>
        </div>
    )
}
