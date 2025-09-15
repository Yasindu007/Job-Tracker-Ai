import JobPrepAssistant from '@/components/job-prep-assistant'
import { stackServerApp } from '../../stack/server'
import { redirect } from 'next/navigation'

export default async function JobPrepPage() {
  const user = await stackServerApp.getUser()

  if (!user) {
    redirect('/handler/sign-in')
  }

  return <JobPrepAssistant />
}
