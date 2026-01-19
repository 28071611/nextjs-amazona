import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import WishlistClient from './wishlist-client'

export const metadata: Metadata = {
  title: 'My Wishlist',
}

export default async function WishlistPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/sign-in?callbackUrl=/wishlist')
  }

  return <WishlistClient userId={session.user.id} />
}
