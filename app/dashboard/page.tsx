import Dashboard from '@/components/dashboard'
import { stackServerApp } from '../../stack/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await stackServerApp.getUser()

  if (!user) {
    redirect('/handler/sign-in')
  }

  return <Dashboard />
}
