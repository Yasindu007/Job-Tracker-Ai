import ResumeAssistant from '@/components/resume-assistant'
import { stackServerApp } from '../../stack/server'
import { redirect } from 'next/navigation'

export default async function ResumePage() {
  const user = await stackServerApp.getUser()

  if (!user) {
    redirect('/handler/sign-in')
  }

  return <ResumeAssistant />
}
