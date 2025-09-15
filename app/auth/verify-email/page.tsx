'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

function VerifyEmailForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('verifying')
  const router = useRouter()

  useEffect(() => {
    if (token) {
      fetch(`/api/auth/verify-email?token=${token}`)
        .then(res => {
          if (res.ok) {
            setStatus('success')
            setTimeout(() => router.push('/auth/login'), 3000)
          } else {
            setStatus('error')
          }
        })
        .catch(() => setStatus('error'))
    }
  }, [token, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8 text-center"
      >
        {status === 'verifying' && (
          <div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Verifying your email...</h2>
            <div className="mt-4 flex justify-center">
              <div className="spinner"></div>
            </div>
          </div>
        )}
        {status === 'success' && (
          <div>
            <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Email Verified!</h2>
            <p className="mt-2 text-sm text-gray-600">You will be redirected to the login page shortly.</p>
          </div>
        )}
        {status === 'error' && (
          <div>
            <XCircleIcon className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Verification Failed</h2>
            <p className="mt-2 text-sm text-gray-600">The verification link is invalid or has expired.</p>
            <div className="mt-6">
              <Link href="/auth/login" className="btn btn-primary">
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  )
}
