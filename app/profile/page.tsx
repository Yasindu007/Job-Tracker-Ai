import dynamic from 'next/dynamic'

const ProfileClientPage = dynamic(() => import('@/components/profile-client-page'), { ssr: false })

export default function ProfilePage() {
  return <ProfileClientPage />
}
