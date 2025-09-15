import { auth } from '@/stack'
import ResumeAssistant from '@/components/resume-assistant'

export default async function ResumePage() {
  await auth.requireUser()

  return <ResumeAssistant />
}