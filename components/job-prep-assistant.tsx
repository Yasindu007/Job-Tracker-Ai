'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import AppShell from './app-shell'
import { 
  ClipboardDocumentListIcon,
  SparklesIcon,
  LightBulbIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { JobPostingPrep } from '@/types'
import toast from 'react-hot-toast'

export default function JobPrepAssistant() {
  const [jobPostingText, setJobPostingText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [prepResults, setPrepResults] = useState<JobPostingPrep | null>(null)

  const handleAnalyze = async () => {
    if (!jobPostingText.trim()) {
      toast.error('Please enter a job posting')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/job-prep/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobPostingText }),
      })

      if (response.ok) {
        const data = await response.json()
        setPrepResults(data)
        toast.success('Job posting analyzed successfully!')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        const errorMessage = errorData.error || `Server returned status ${response.status}`
        console.error('Job prep analysis error:', errorMessage)
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Network error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to analyze job posting. Please check your connection.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <AppShell>
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">Job Prep Assistant</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Paste Job Posting
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Enter the job posting text to get personalized preparation insights, interview questions, and skill gap analysis.
              </p>
              
              <textarea
                value={jobPostingText}
                onChange={(e) => setJobPostingText(e.target.value)}
                placeholder="Paste the job description here..."
                className="input min-h-[400px] resize-none"
              />

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !jobPostingText.trim()}
                className="btn btn-primary btn-md w-full mt-4"
              >
                {isAnalyzing ? (
                  <div className="flex items-center">
                    <div className="spinner mr-2" />
                    Analyzing...
                  </div>
                ) : (
                  <>
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    Analyze Job Posting
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {prepResults ? (
              <>
                {/* Resume Suggestions */}
                {prepResults.resumeSuggestions && prepResults.resumeSuggestions.length > 0 && (
                  <div className="card p-6">
                    <div className="flex items-center mb-4">
                      <DocumentTextIcon className="h-6 w-6 text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold text-foreground">
                        Resume Customization Suggestions
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {prepResults.resumeSuggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-foreground">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Interview Questions */}
                {prepResults.interviewQuestions && prepResults.interviewQuestions.length > 0 && (
                  <div className="card p-6">
                    <div className="flex items-center mb-4">
                      <LightBulbIcon className="h-6 w-6 text-yellow-600 mr-2" />
                      <h3 className="text-lg font-semibold text-foreground">
                        Likely Interview Questions
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {prepResults.interviewQuestions.map((question, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                          <span className="text-foreground">{question}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Skill Gaps */}
                {prepResults.skillGaps && prepResults.skillGaps.length > 0 && (
                  <div className="card p-6">
                    <div className="flex items-center mb-4">
                      <AcademicCapIcon className="h-6 w-6 text-purple-600 mr-2" />
                      <h3 className="text-lg font-semibold text-foreground">
                        Skill Gaps to Address
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {prepResults.skillGaps.map((gap, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                          <span className="text-foreground">{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Learning Resources */}
                {prepResults.resources && prepResults.resources.length > 0 && (
                  <div className="card p-6">
                    <div className="flex items-center mb-4">
                      <AcademicCapIcon className="h-6 w-6 text-green-600 mr-2" />
                      <h3 className="text-lg font-semibold text-foreground">
                        Learning Resources
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {prepResults.resources.map((resource, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                          <span className="text-foreground">{resource}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="card p-6">
                <div className="text-center py-12">
                  <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Ready to Analyze
                  </h3>
                  <p className="text-muted-foreground">
                    Paste a job posting and click "Analyze Job Posting" to get personalized preparation insights, interview questions, and skill gap analysis.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
