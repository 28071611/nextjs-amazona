'use client'

import React from 'react'

export default function NotFound() {
    return (
        <html lang='en'>
            <body className='flex flex-col items-center justify-center min-h-screen font-sans'>
                <div className='p-6 rounded-lg shadow-md text-center bg-white border'>
                    <h1 className='text-3xl font-bold mb-4 text-gray-800'>404 - Page Not Found</h1>
                    <p className='text-gray-600 mb-6'>
                        The page you are looking for does not exist or has been moved.
                    </p>
                    <a
                        href='/'
                        className='inline-block px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors'
                    >
                        Back to home
                    </a>
                </div>
            </body>
        </html>
    )
}
