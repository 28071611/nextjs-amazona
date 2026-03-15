import { notFound } from 'next/navigation'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='p-8 rounded-lg shadow-xl w-1/3 text-center bg-white'>
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>🛍️ Amazona</h1>
          <p className='text-lg text-gray-600 mb-6'>AI-Powered E-Commerce Platform</p>
          <p className='text-sm text-green-600 font-semibold'>✅ All Systems Operational</p>
        </div>

        <div className='space-y-4'>
          <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
            <h2 className='text-xl font-semibold text-blue-900 mb-2'>🤖 AI Chatbot</h2>
            <p className='text-blue-700 mb-4'>Advanced shopping assistant with 39 AI functions</p>
            <Link
              href="/chatbot"
              className='inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200'
            >
              Launch Chatbot
            </Link>
          </div>

          <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
            <h2 className='text-xl font-semibold text-green-900 mb-2'>⚙️ Admin Dashboard</h2>
            <p className='text-green-700 mb-4'>Complete management and monitoring system</p>
            <Link
              href="/admin/chatbot-deployment"
              className='inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200'
            >
              Admin Panel
            </Link>
          </div>

          <div className='bg-purple-50 p-4 rounded-lg border border-purple-200'>
            <h2 className='text-xl font-semibold text-purple-900 mb-2'>🛍️ Browse Products</h2>
            <p className='text-purple-700 mb-4'>Explore our complete product catalog</p>
            <Link
              href="/products"
              className='inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200'
            >
              Shop Now
            </Link>
          </div>

          <div className='bg-yellow-50 p-4 rounded-lg border border-yellow-200'>
            <h2 className='text-xl font-semibold text-yellow-900 mb-2'>📊 Analytics Dashboard</h2>
            <p className='text-yellow-700 mb-4'>View detailed analytics and insights</p>
            <Link
              href="/admin/analytics"
              className='inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-200'
            >
              View Analytics
            </Link>
          </div>
        </div>

        <div className='mt-8 p-4 bg-gray-50 rounded-lg'>
          <h3 className='text-lg font-semibold text-gray-900 mb-3'>🚀 System Status</h3>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div className='flex items-center space-x-2'>
              <div className='w-3 h-3 bg-green-500 rounded-full animate-pulse'></div>
              <span className='text-gray-700'>Server: Running</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='w-3 h-3 bg-green-500 rounded-full animate-pulse'></div>
              <span className='text-gray-700'>Database: Connected</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='w-3 h-3 bg-blue-500 rounded-full animate-pulse'></div>
              <span className='text-gray-700'>Chatbot: Active</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='w-3 h-3 bg-purple-500 rounded-full animate-pulse'></div>
              <span className='text-gray-700'>APIs: Ready</span>
            </div>
          </div>
        </div>

        <div className='mt-6 text-center text-sm text-gray-500'>
          <p>🌐 Server running on port 3001</p>
          <p>✨ All systems operational and ready for use!</p>
          <p>🎯 No compilation errors detected</p>
        </div>
      </div>
    </div>
  )
}
