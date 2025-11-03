'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon, CalendarIcon, ClockIcon, CloudIcon } from '@heroicons/react/24/outline'
import { Job, JobStatus } from '@/types'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface JobFormProps {
  job?: Job
  onClose: () => void
  onSuccess: (
    job: Job,
    options?: {
      calendarSyncStatus?: 'success' | 'failed'
    }
  ) => void
}

export default function JobForm({ job, onClose, onSuccess }: JobFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    status: JobStatus.APPLIED,
    notes: '',
    jobUrl: '',
    location: '',
    salary: '',
    dateApplied: new Date().toISOString().split('T')[0],
    expectedInterviewDate: '',
    expectedInterviewTime: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [syncToCalendar, setSyncToCalendar] = useState(false)
  const [calendarConnected, setCalendarConnected] = useState(false)

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title,
        company: job.company,
        status: job.status,
        notes: job.notes || '',
        jobUrl: job.jobUrl || '',
        location: job.location || '',
        salary: job.salary || '',
        dateApplied: job.dateApplied ? new Date(job.dateApplied).toISOString().split('T')[0] : '',
        expectedInterviewDate: job.expectedInterviewDate
          ? new Date(job.expectedInterviewDate).toISOString().split('T')[0]
          : "",
        expectedInterviewTime: job.expectedInterviewTime || '',
      })
      setSyncToCalendar(job.calendarSynced || false)
    }
  }, [job])

  useEffect(() => {
    // Check calendar connection status
    fetch('/api/calendar/status')
      .then(response => response.json())
      .then(data => {
        setCalendarConnected(data.google || data.apple)
      })
      .catch(error => {
        console.error('Failed to check calendar status:', error)
      })
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.company) {
      toast.error('Title and company are required')
      return
    }

    setIsLoading(true)

    try {
      const url = job ? `/api/jobs/${job.id}` : '/api/jobs'
      const method = job ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          dateApplied: formData.dateApplied ? new Date(formData.dateApplied).toISOString() : new Date().toISOString(),
          expectedInterviewDate: formData.expectedInterviewDate || null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Sync to calendar if requested and interview status
        if (syncToCalendar && isInterviewStatus && calendarConnected) {
          try {
            const syncResponse = await fetch('/api/calendar/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                jobId: data.id,
                action: job ? 'update' : 'create',
              }),
            })

            if (syncResponse.ok) {
              onSuccess(data, { calendarSyncStatus: 'success' })
            } else {
              onSuccess(data, { calendarSyncStatus: 'failed' })
            }
          } catch (error) {
            onSuccess(data, { calendarSyncStatus: 'failed' })
          }
        } else {
          onSuccess(data)
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save job')
      }
    } catch (error) {
      toast.error('Failed to save job')
    } finally {
      setIsLoading(false)
    }
  }

  const isInterviewStatus = formData.status === JobStatus.INTERVIEW

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-foreground">
            {job ? 'Edit Job' : 'Add New Job'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                Job Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="input"
                placeholder="e.g. Software Engineer"
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                Company *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                required
                value={formData.company}
                onChange={handleInputChange}
                className="input"
                placeholder="e.g. Google"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="input"
              >
                <option value={JobStatus.APPLIED}>Applied</option>
                <option value={JobStatus.INTERVIEW}>Interview</option>
                <option value={JobStatus.OFFERED}>Offered</option>
                <option value={JobStatus.REJECTED}>Rejected</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="input"
                placeholder="e.g. San Francisco, CA"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="salary" className="block text-sm font-medium text-foreground mb-2">
                Salary
              </label>
              <input
                type="text"
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                className="input"
                placeholder="e.g. $80,000 - $100,000"
              />
            </div>

            <div>
              <label htmlFor="jobUrl" className="block text-sm font-medium text-foreground mb-2">
                Job URL
              </label>
              <input
                type="url"
                id="jobUrl"
                name="jobUrl"
                value={formData.jobUrl}
                onChange={handleInputChange}
                className="input"
                placeholder="https://company.com/job-posting"
              />
            </div>
          </div>

          <div>
            <label htmlFor="dateApplied" className="block text-sm font-medium text-foreground mb-2">
              Date Applied
            </label>
            <input
              type="date"
              id="dateApplied"
              name="dateApplied"
              value={formData.dateApplied}
              onChange={handleInputChange}
              className="input"
            />
          </div>

          {isInterviewStatus && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="expectedInterviewDate" className="block text-sm font-medium text-foreground mb-2">
                    <CalendarIcon className="h-4 w-4 inline mr-1" />
                    Interview Date
                  </label>
                  <input
                    type="date"
                    id="expectedInterviewDate"
                    name="expectedInterviewDate"
                    value={formData.expectedInterviewDate}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>

                <div>
                  <label htmlFor="expectedInterviewTime" className="block text-sm font-medium text-foreground mb-2">
                    <ClockIcon className="h-4 w-4 inline mr-1" />
                    Interview Time
                  </label>
                  <input
                    type="time"
                    id="expectedInterviewTime"
                    name="expectedInterviewTime"
                    value={formData.expectedInterviewTime}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
              </div>

              {calendarConnected && (
                <div className="flex items-center">
                  <input
                    id="syncToCalendar"
                    name="syncToCalendar"
                    type="checkbox"
                    checked={syncToCalendar}
                    onChange={(e) => setSyncToCalendar(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="syncToCalendar" className="ml-2 block text-sm text-foreground flex items-center">
                    <CloudIcon className="h-4 w-4 mr-1" />
                    Sync to Google Calendar
                  </label>
                </div>
              )}
            </div>
          )}

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              value={formData.notes}
              onChange={handleInputChange}
              className="input"
              placeholder="Add any additional notes about this job application..."
            />
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline btn-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-md"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="spinner mr-2" />
                  {job ? 'Updating...' : 'Adding...'}
                </div>
              ) : (
                job ? 'Update Job' : 'Add Job'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
