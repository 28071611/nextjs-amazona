import { redirect } from 'next/navigation'

export default function RootPage() {
  // Failsafe redirect to default locale if middleware doesn't catch it
  redirect('/en-US')
}

