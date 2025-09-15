import { auth } from '@/stack'
import JobPrepAssistant from '@/components/job-prep-assistant'

export default async function JobPrepPage() {
  await auth.requireUser()

  return <JobPrepAssistant />
}