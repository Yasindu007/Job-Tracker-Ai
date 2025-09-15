'use client'

import { useUser, auth } from '@/stack'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { BriefcaseIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const user = useUser()
  const router = useRouter()

  if (user.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!user.data) {
    router.push('/handler/sign-in')
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
          <p className="text-lg font-medium text-gray-900">Welcome, {user.data?.displayName}</p>
          <p className="mt-2 text-sm text-gray-600">You are signed in with {user.data?.email}</p>
        </div>

        <div className="mt-8">
          <auth.SignOut>
            <button
              className="btn btn-danger btn-md w-full flex items-center justify-center"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
              Logout
            </button>
          </auth.SignOut>
        </div>
      </motion.div>
    </div>
  )
}