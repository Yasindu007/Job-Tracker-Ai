import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import JobPrepAssistant from '@/components/job-prep-assistant'

export default async function JobPrepPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return <JobPrepAssistant />
}
