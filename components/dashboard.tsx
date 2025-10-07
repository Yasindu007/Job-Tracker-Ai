'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/stack'
import { motion } from 'framer-motion'
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CalendarIcon,
  UserIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import JobCard from '@/components/job-card'
import JobForm from '@/components/job-form'
import ProfileSetup from '@/components/profile-setup'
import Navigation from '@/components/navigation'
import CalendarSettings from '@/components/calendar-settings'
import { Job, JobStatus } from '@/types'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const user = useUser()
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showJobForm, setShowJobForm] = useState(false)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [showCalendarSettings, setShowCalendarSettings] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'ALL'>('ALL')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')

  useEffect(() => {
    if (user) {
      fetchJobs()
      checkProfileCompletion()
    }
  }, [user])

  useEffect(() => {
    filterAndSortJobs()
  }, [jobs, searchTerm, statusFilter, sortBy])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs')
      if (response.ok) {
        const data = await response.json()
        setJobs(data)
      }
    } catch (error) {
      toast.error('Failed to fetch jobs')
    } finally {
      setIsLoading(false)
    }
  }

  const checkProfileCompletion = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        if (!data.isProfileComplete) {
          setShowProfileSetup(true)
        }
      }
    } catch (error) {
      console.error('Failed to check profile completion:', error)
    }
  }

  const filterAndSortJobs = () => {
    let filtered = jobs

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(job => job.status === statusFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime()
      } else {
        return new Date(a.dateApplied).getTime() - new Date(b.dateApplied).getTime()
      }
    })

    setFilteredJobs(filtered)
  }

  const handleJobAdded = (newJob: Job, options?: { calendarSyncStatus?: 'success' | 'failed' }) => {
    setJobs(prev => [newJob, ...prev])
    setShowJobForm(false)
    if (options?.calendarSyncStatus === 'success') {
      toast.success('Job saved and synced to calendar!')
    } else if (options?.calendarSyncStatus === 'failed') {
      toast.error('Job saved, but calendar sync failed.')
    } else {
      toast.success('Job saved successfully!')
    }
  }

  const handleJobUpdated = (updatedJob: Job, options?: { calendarSyncStatus?: 'success' | 'failed' }) => {
    setJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job))
    if (options?.calendarSyncStatus === 'success') {
      toast.success('Job updated and synced to calendar!')
    } else if (options?.calendarSyncStatus === 'failed') {
      toast.error('Job updated, but calendar sync failed.')
    } else {
      toast.success('Job updated successfully!')
    }
  }

  const handleJobDeleted = (jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId))
    toast.success('Job deleted successfully!')
  }

  const handleProfileComplete = () => {
    setShowProfileSetup(false)
    toast.success('Profile completed successfully!')
  }

  const stats = {
    total: jobs.length,
    applied: jobs.filter(job => job.status === JobStatus.APPLIED).length,
    interview: jobs.filter(job => job.status === JobStatus.INTERVIEW).length,
    offered: jobs.filter(job => job.status === JobStatus.OFFERED).length,
    rejected: jobs.filter(job => job.status === JobStatus.REJECTED).length,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" style={{ width: '2rem', height: '2rem' }}></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b lg:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <BriefcaseIcon className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Job Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCalendarSettings(true)}
                className="btn btn-outline btn-md flex items-center"
              >
                <Cog6ToothIcon className="h-5 w-5 mr-2" />
                Calendar
              </button>
              <button
                onClick={() => setShowJobForm(true)}
                className="btn btn-primary btn-md flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Job
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:ml-64">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BriefcaseIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Applied</p>
                <p className="text-2xl font-bold text-gray-900">{stats.applied}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Interview</p>
                <p className="text-2xl font-bold text-gray-900">{stats.interview}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Offered</p>
                <p className="text-2xl font-bold text-gray-900">{stats.offered}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <BriefcaseIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as JobStatus | 'ALL')}
                className="input"
              >
                <option value="ALL">All Status</option>
                <option value={JobStatus.APPLIED}>Applied</option>
                <option value={JobStatus.INTERVIEW}>Interview</option>
                <option value={JobStatus.OFFERED}>Offered</option>
                <option value={JobStatus.REJECTED}>Rejected</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                className="input"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-4">
                {jobs.length === 0 
                  ? "Get started by adding your first job application"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
              {jobs.length === 0 && (
                <button
                  onClick={() => setShowJobForm(true)}
                  className="btn btn-primary btn-md"
                >
                  Add Your First Job
                </button>
              )}
            </div>
          ) : (
            filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <JobCard
                  job={job}
                  onUpdate={handleJobUpdated}
                  onDelete={handleJobDeleted}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {showJobForm && (
        <JobForm
          onClose={() => setShowJobForm(false)}
          onSuccess={handleJobAdded}
        />
      )}

      {showProfileSetup && (
        <ProfileSetup
          onClose={() => setShowProfileSetup(false)}
          onComplete={handleProfileComplete}
        />
      )}

      {showCalendarSettings && (
        <CalendarSettings
          onClose={() => setShowCalendarSettings(false)}
        />
      )}
    </div>
  )
}