'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  XMarkIcon, 
  CloudIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LinkIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface CalendarSettingsProps {
  onClose: () => void
}

export default function CalendarSettings({ onClose }: CalendarSettingsProps) {
  const [calendarStatus, setCalendarStatus] = useState({
    google: false,
    apple: false,
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  useEffect(() => {
    fetchCalendarStatus()
  }, [])

  const fetchCalendarStatus = async () => {
    try {
      const response = await fetch('/api/calendar/status')
      if (response.ok) {
        const data = await response.json()
        setCalendarStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch calendar status:', error)
    }
  }

  const handleConnectGoogle = async () => {
    setIsConnecting(true)
    try {
      const response = await fetch('/api/calendar/connect/google')
      if (response.ok) {
        const data = await response.json()
        window.location.href = data.authUrl
      } else {
        toast.error('Failed to initiate Google Calendar connection')
      }
    } catch (error) {
      toast.error('Failed to connect to Google Calendar')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async (provider: string) => {
    setIsDisconnecting(true)
    try {
      const response = await fetch('/api/calendar/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider }),
      })

      if (response.ok) {
        setCalendarStatus(prev => ({ ...prev, [provider]: false }))
        toast.success(`${provider} calendar disconnected successfully`)
      } else {
        toast.error(`Failed to disconnect ${provider} calendar`)
      }
    } catch (error) {
      toast.error(`Failed to disconnect ${provider} calendar`)
    } finally {
      setIsDisconnecting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Calendar Integration
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <CloudIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Connect Your Calendar
            </h3>
            <p className="text-gray-600">
              Sync your interview schedules with your calendar to never miss an appointment.
            </p>
          </div>

          {/* Google Calendar */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Google Calendar</h4>
                  <p className="text-sm text-gray-500">Sync with your Google Calendar</p>
                </div>
              </div>
              
              <div className="flex items-center">
                {calendarStatus.google ? (
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">Connected</span>
                    <button
                      onClick={() => handleDisconnect('google')}
                      disabled={isDisconnecting}
                      className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleConnectGoogle}
                    disabled={isConnecting}
                    className="btn btn-primary btn-sm flex items-center"
                  >
                    {isConnecting ? (
                      <div className="flex items-center">
                        <div className="spinner mr-2" style={{ width: '1rem', height: '1rem' }}></div>
                        Connecting...
                      </div>
                    ) : (
                      <>
                        <LinkIcon className="h-4 w-4 mr-1" />
                        Connect
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Apple Calendar - Coming Soon */}
          <div className="border rounded-lg p-4 opacity-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="h-6 w-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Apple Calendar</h4>
                  <p className="text-sm text-gray-500">Coming soon</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-sm text-gray-500">Coming Soon</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Connect your Google Calendar account</li>
              <li>• Interview appointments are automatically synced</li>
              <li>• Get email and popup reminders</li>
              <li>• Events include job details and notes</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
