'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  CalendarIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from '@heroicons/react/24/outline'
import { Job, JobStatus } from '@/types'

export default function Analytics() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs')
      if (response.ok) {
        const data = await response.json()
        setJobs(data)
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" style={{ width: '2rem', height: '2rem' }}></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const stats = {
    total: jobs.length,
    applied: jobs.filter(job => job.status === JobStatus.APPLIED).length,
    interview: jobs.filter(job => job.status === JobStatus.INTERVIEW).length,
    offered: jobs.filter(job => job.status === JobStatus.OFFERED).length,
    rejected: jobs.filter(job => job.status === JobStatus.REJECTED).length,
  }

  const successRate = stats.total > 0 ? Math.round((stats.offered / stats.total) * 100) : 0
  const interviewRate = stats.total > 0 ? Math.round((stats.interview / stats.total) * 100) : 0

  // Calculate average job fit score
  const jobsWithScores = jobs.filter(job => job.jobFitScore !== null && job.jobFitScore !== undefined)
  const avgJobFitScore = jobsWithScores.length > 0 
    ? Math.round(jobsWithScores.reduce((sum, job) => sum + (job.jobFitScore || 0), 0) / jobsWithScores.length)
    : 0

  // Monthly application trends
  const monthlyData = jobs.reduce((acc, job) => {
    const month = new Date(job.dateApplied).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const monthlyEntries = Object.entries(monthlyData).slice(-6) // Last 6 months

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b lg:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Analytics</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:ml-64">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
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
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUpIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{successRate}%</p>
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
                <p className="text-sm font-medium text-gray-600">Interview Rate</p>
                <p className="text-2xl font-bold text-gray-900">{interviewRate}%</p>
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
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Job Fit</p>
                <p className="text-2xl font-bold text-gray-900">{avgJobFitScore}%</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Application Status Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Application Status Distribution
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">Applied</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{stats.applied}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${stats.total > 0 ? (stats.applied / stats.total) * 100 : 0}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">Interview</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{stats.interview}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${stats.total > 0 ? (stats.interview / stats.total) * 100 : 0}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">Offered</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{stats.offered}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${stats.total > 0 ? (stats.offered / stats.total) * 100 : 0}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">Rejected</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{stats.rejected}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </motion.div>

          {/* Monthly Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Application Trends (Last 6 Months)
            </h3>
            {monthlyEntries.length > 0 ? (
              <div className="space-y-4">
                {monthlyEntries.map(([month, count]) => (
                  <div key={month} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{month}</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ 
                            width: `${Math.max(10, (count / Math.max(...monthlyEntries.map(([, c]) => c))) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No data available yet</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-6 mt-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Key Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Performance Summary</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• You've applied to {stats.total} jobs total</li>
                <li>• {interviewRate}% of applications led to interviews</li>
                <li>• {successRate}% of applications resulted in job offers</li>
                <li>• Average job fit score: {avgJobFitScore}%</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {successRate < 10 && (
                  <li>• Consider improving your resume and interview skills</li>
                )}
                {interviewRate < 20 && (
                  <li>• Focus on better job targeting and application quality</li>
                )}
                {avgJobFitScore < 70 && (
                  <li>• Work on developing skills that match your target roles</li>
                )}
                <li>• Keep applying consistently to increase your chances</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
