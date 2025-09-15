import { auth } from '@/stack'
import Dashboard from '@/components/dashboard'

export default async function DashboardPage() {
  await auth.requireUser()

  return <Dashboard />
}