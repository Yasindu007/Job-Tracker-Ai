'use client'

import { useUser, auth } from '@/stack'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import AppShell from './app-shell'
import { BriefcaseIcon, ArrowLeftOnRectangleIcon, UserIcon } from '@heroicons/react/24/outline'

export default function ProfileClientPage() {
  const user = useUser()
  const router = useRouter()

  if (user === undefined) {
    // Still loading, render a loading state or nothing
    return null;
  }

  if (user === null) {
    router.push('/handler/sign-in')
    return null
  }

  // If we reach here, user is not null or undefined, so they are logged in.

  return (
    <AppShell>
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <UserIcon className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card p-8 max-w-md mx-auto"
        >
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {user?.profileImageUrl ? (
                <img
                  className="h-24 w-24 rounded-full border-4 border-blue-600"
                  src={user.profileImageUrl}
                  alt={user.displayName || 'User'}
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center border-4 border-blue-600">
                  <UserIcon className="h-12 w-12 text-blue-600" />
                </div>
              )}
            </div>
            <h2 className="text-3xl font-bold text-foreground">Your Profile</h2>
          </div>

          <div className="mt-8 text-center space-y-2">
            <p className="text-lg font-medium text-foreground">Welcome, {user.displayName}</p>
            <p className="text-sm text-muted-foreground">You are signed in with {user.primaryEmail}</p>
          </div>

          <div className="mt-8">
            <button
              onClick={() => user && user.signOut({ redirectUrl: '/' })}
              className="btn btn-outline btn-md w-full flex items-center justify-center"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
              Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    </AppShell>
  )
}