import LandingPage from '@/components/landing-page'
import { stackServerApp } from '../stack/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const user = await stackServerApp.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return <LandingPage />
}
