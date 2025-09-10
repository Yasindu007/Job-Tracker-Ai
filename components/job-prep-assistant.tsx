'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  DocumentTextIcon, 
  LightBulbIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ArrowDownTrayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { JobPostingPrep } from '@/types'
import toast from 'react-hot-toast'

export default function JobPrepAssistant() {
  const [jobPostingText, setJobPostingText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [prepResults, setPrepResults] = useState<JobPostingPrep | null>(null)
  const [showResults, setShowResults] = useState(false)

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
        body: JSON.stringify({
          jobPostingText: jobPostingText.trim(),
        }),
      })

      if (response.ok) {
        const results = await response.json()
        setPrepResults(results)
        setShowResults(true)
        toast.success('Job posting analysis completed!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to analyze job posting')
      }
    } catch (error) {
      toast.error('Failed to analyze job posting')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDownloadPrep = async () => {
    if (!prepResults) return

    try {
      const response = await fetch('/api/job-prep/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobPostingText,
          prepResults,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'job_preparation_guide.txt'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Preparation guide downloaded!')
      } else {
        toast.error('Failed to download preparation guide')
      }
    } catch (error) {
      toast.error('Failed to download preparation guide')
    }
  }

  const handleClear = () => {
    setJobPostingText('')
    setPrepResults(null)
    setShowResults(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b lg:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Job Prep Assistant</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:ml-64">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Paste Job Posting
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="jobPosting" className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description
                  </label>
                  <textarea
                    id="jobPosting"
                    rows={12}
                    value={jobPostingText}
                    onChange={(e) => setJobPostingText(e.target.value)}
                    className="input resize-none"
                    placeholder="Paste the complete job posting here..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !jobPostingText.trim()}
                    className="btn btn-primary btn-md flex-1"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center justify-center">
                        <div className="spinner mr-2" />
                        Analyzing...
                      </div>
                    ) : (
                      'Analyze Job Posting'
                    )}
                  </button>
                  <button
                    onClick={handleClear}
                    className="btn btn-outline btn-md"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tips for Better Analysis
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  Include the complete job description for best results
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  Make sure to include requirements and qualifications
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  Include company information if available
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  The more detailed the posting, the better the analysis
                </li>
              </ul>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {showResults && prepResults ? (
              <>
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Analysis Results
                    </h3>
                    <button
                      onClick={handleDownloadPrep}
                      className="btn btn-outline btn-sm flex items-center"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                      Download Guide
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Resume Suggestions */}
                    {prepResults.resumeSuggestions.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-500" />
                          Resume Customization Tips
                        </h4>
                        <ul className="space-y-2">
                          {prepResults.resumeSuggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                              <span className="text-gray-700 text-sm">{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Interview Questions */}
                    {prepResults.interviewQuestions.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <QuestionMarkCircleIcon className="h-5 w-5 mr-2 text-green-500" />
                          Likely Interview Questions
                        </h4>
                        <ul className="space-y-2">
                          {prepResults.interviewQuestions.map((question, index) => (
                            <li key={index} className="flex items-start">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                              <span className="text-gray-700 text-sm">{question}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Skill Gaps */}
                    {prepResults.skillGaps.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <ChartBarIcon className="h-5 w-5 mr-2 text-orange-500" />
                          Skill Gaps to Address
                        </h4>
                        <ul className="space-y-2">
                          {prepResults.skillGaps.map((gap, index) => (
                            <li key={index} className="flex items-start">
                              <span className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                              <span className="text-gray-700 text-sm">{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Resources */}
                    {prepResults.resources.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <BookOpenIcon className="h-5 w-5 mr-2 text-purple-500" />
                          Learning Resources
                        </h4>
                        <ul className="space-y-2">
                          {prepResults.resources.map((resource, index) => (
                            <li key={index} className="flex items-start">
                              <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                              <span className="text-gray-700 text-sm">{resource}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="card p-6">
                <div className="text-center py-12">
                  <LightBulbIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Get Personalized Job Prep
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Paste a job posting to get tailored resume suggestions, interview questions, and skill gap analysis.
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>✓ Resume customization tips</p>
                    <p>✓ Likely interview questions</p>
                    <p>✓ Skill gap analysis</p>
                    <p>✓ Learning resources</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
