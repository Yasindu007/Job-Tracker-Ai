import { redirect } from 'next/navigation'
import { auth } from '@/stack'
import LandingPage from '@/components/landing-page'

export default async function Home() {
  const user = await auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return <LandingPage />
}