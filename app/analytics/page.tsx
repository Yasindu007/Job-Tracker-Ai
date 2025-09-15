import { auth } from '@/stack'
import Analytics from '@/components/analytics'

export default async function AnalyticsPage() {
  await auth.requireUser()

  return <Analytics />
}