'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  PencilIcon, 
  TrashIcon, 
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ArrowTopRightOnSquareIcon,
  ChartBarIcon,
  CloudIcon,
  CloudArrowDownIcon
} from '@heroicons/react/24/outline'
import { Job, JobStatus } from '@/types'
import { formatDate, getJobStatusColor, getJobFitScoreColor } from '@/lib/utils'
import JobForm from './job-form'
import toast from 'react-hot-toast'

interface JobCardProps {
  job: Job
  onUpdate: (job: Job) => void
  onDelete: (jobId: string) => void
}

export default function JobCard({ job, onUpdate, onDelete }: JobCardProps) {
  const [showEditForm, setShowEditForm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job?')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onDelete(job.id)
      } else {
        toast.error('Failed to delete job')
      }
    } catch (error) {
      toast.error('Failed to delete job')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUpdate = (updatedJob: Job) => {
    onUpdate(updatedJob)
    setShowEditForm(false)
  }

  const handleCalendarSync = async (action: 'create' | 'delete') => {
    if (!job.expectedInterviewDate || !job.expectedInterviewTime) {
      toast.error('Interview date and time are required for calendar sync')
      return
    }

    setIsSyncing(true)
    try {
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: job.id,
          action,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Update the job with calendar sync status
        const updatedJob = {
          ...job,
          calendarSynced: action === 'create',
          calendarEventId: action === 'create' ? data.eventId : null,
        }
        onUpdate(updatedJob)
        toast.success(`Calendar event ${action}d successfully!`)
      } else {
        const error = await response.json()
        toast.error(error.error || `Failed to ${action} calendar event`)
      }
    } catch (error) {
      toast.error(`Failed to ${action} calendar event`)
    } finally {
      setIsSyncing(false)
    }
  }

  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case JobStatus.APPLIED:
        return '📄'
      case JobStatus.INTERVIEW:
        return '🎯'
      case JobStatus.OFFERED:
        return '🎉'
      case JobStatus.REJECTED:
        return '❌'
      default:
        return '📋'
    }
  }

  return (
    <>
      <div className="card p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{getStatusIcon(job.status)}</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                <p className="text-gray-600">{job.company}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span>Applied {formatDate(new Date(job.dateApplied))}</span>
              </div>
              {job.location && (
                <div className="flex items-center gap-1">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
              )}
              {job.salary && (
                <div className="flex items-center gap-1">
                  <CurrencyDollarIcon className="h-4 w-4" />
                  <span>{job.salary}</span>
                </div>
              )}
            </div>

            {job.notes && (
              <p className="text-gray-700 mb-3 line-clamp-2">{job.notes}</p>
            )}

            {job.expectedInterviewDate && (
              <div className="flex items-center gap-1 text-sm text-blue-600 mb-3">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  Interview: {formatDate(new Date(job.expectedInterviewDate))}
                  {job.expectedInterviewTime && ` at ${job.expectedInterviewTime}`}
                </span>
              </div>
            )}

            <div className="flex items-center gap-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJobStatusColor(job.status)}`}>
                {job.status}
              </span>
              
              {job.jobFitScore !== null && job.jobFitScore !== undefined && (
                <div className="flex items-center gap-1">
                  <ChartBarIcon className="h-4 w-4" />
                  <span className={`text-sm font-medium ${getJobFitScoreColor(job.jobFitScore)}`}>
                    Fit: {job.jobFitScore}%
                  </span>
                </div>
              )}

              {job.calendarSynced && (
                <div className="flex items-center gap-1 text-green-600">
                  <CloudIcon className="h-4 w-4" />
                  <span className="text-xs font-medium">Synced</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {job.jobUrl && (
              <a
                href={job.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="View job posting"
              >
                <ArrowTopRightOnSquareIcon className="h-5 w-5" />
              </a>
            )}
            
            {job.status === JobStatus.INTERVIEW && job.expectedInterviewDate && job.expectedInterviewTime && (
              <button
                onClick={() => handleCalendarSync(job.calendarSynced ? 'delete' : 'create')}
                disabled={isSyncing}
                className={`p-2 transition-colors disabled:opacity-50 ${
                  job.calendarSynced 
                    ? 'text-green-600 hover:text-red-600' 
                    : 'text-gray-400 hover:text-green-600'
                }`}
                title={job.calendarSynced ? 'Remove from calendar' : 'Add to calendar'}
              >
                {isSyncing ? (
                  <div className="spinner" style={{ width: '1.25rem', height: '1.25rem' }}></div>
                ) : job.calendarSynced ? (
                  <CloudArrowDownIcon className="h-5 w-5" />
                ) : (
                  <CloudIcon className="h-5 w-5" />
                )}
              </button>
            )}
            
            <button
              onClick={() => setShowEditForm(true)}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit job"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
              title="Delete job"
            >
              {isDeleting ? (
                <div className="spinner" style={{ width: '1.25rem', height: '1.25rem' }}></div>
              ) : (
                <TrashIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {showEditForm && (
        <JobForm
          job={job}
          onClose={() => setShowEditForm(false)}
          onSuccess={handleUpdate}
        />
      )}
    </>
  )
}
