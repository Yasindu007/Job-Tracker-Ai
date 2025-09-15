import Analytics from '@/components/analytics'
import { stackServerApp } from '../../stack/server'
import { redirect } from 'next/navigation'

export default async function AnalyticsPage() {
  const user = await stackServerApp.getUser()

  if (!user) {
    redirect('/handler/sign-in')
  }

  return <Analytics />
}
