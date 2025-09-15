'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { BriefcaseIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-8"
      >
        <div className="text-center">
          <div className="flex justify-center">
            <BriefcaseIcon className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Your Profile</h2>
        </div>

        <div className="mt-8 text-center">
          <p className="text-lg font-medium text-gray-900">Welcome, {session?.user?.name}</p>
          <p className="mt-2 text-sm text-gray-600">You are signed in with {session?.user?.email}</p>
        </div>

        <div className="mt-8">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="btn btn-danger btn-md w-full flex items-center justify-center"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
            Logout
          </button>
        </div>
      </motion.div>
    </div>
  )
}
