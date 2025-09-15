'use client'

import { useRouter } from 'next/navigation'

export default function AuthErrorPage() {
  const router = useRouter()

  return (
    <div>
      <h1>Login Error</h1>
      <p>An error occurred during login. Please try again.</p>
      <button onClick={() => router.push('/auth/login')}>
        Go back to login
      </button>
    </div>
  )
}
