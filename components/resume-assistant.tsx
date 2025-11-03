'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import AppShell from './app-shell'
import { 
  DocumentArrowUpIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  LightBulbIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Resume, ResumeAnalysis } from '@/types'
import { validateFileType, validateFileSize, getFileTypeIcon } from '@/lib/file-utils'
import { getATSScoreColor, formatFileSize } from '@/lib/utils'
import toast from 'react-hot-toast'

const MAX_FILE_SIZE = 10485760 // 10MB

export default function ResumeAssistant() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null)
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await handleFiles(files)
    }
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      await handleFiles(files)
    }
  }

  const handleFiles = async (files: File[]) => {
    setIsLoading(true)

    try {
      for (const file of files) {
        if (!validateFileType(file)) {
          toast.error(`${file.name}: Only PDF and DOCX files are allowed`)
          continue
        }

        if (!validateFileSize(file)) {
          toast.error(`${file.name}: File size exceeds limit of ${formatFileSize(MAX_FILE_SIZE)}`)
          continue
        }

        const extractFormData = new FormData()
        extractFormData.append('file', file)

        const extractResponse = await fetch('/api/resume/extract-text', {
          method: 'POST',
          body: extractFormData,
        })

        if (!extractResponse.ok) {
          const errorData = await extractResponse.json()
          toast.error(`${file.name}: ${errorData.error || 'Failed to extract text'}`)
          continue
        }

        const { text: extractedText } = await extractResponse.json()

        const formData = new FormData()
        formData.append('file', file)
        formData.append('extractedText', extractedText)

        const response = await fetch('/api/resume/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const resume = await response.json()
          setResumes(prev => [resume, ...prev])
          toast.success(`${file.name} uploaded successfully!`)
        } else {
          const error = await response.json()
          toast.error(`${file.name}: ${error.error}`)
        }
      }
    } catch (error) {
      toast.error('Failed to upload files')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalyzeResume = async (resume: Resume) => {
    setIsAnalyzing(true)
    setSelectedResume(resume)

    try {
      const response = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId: resume.id,
          resumeText: resume.extractedText,
        }),
      })

      if (response.ok) {
        const analysisResult = await response.json()
        setAnalysis(analysisResult)
        toast.success('Resume analysis completed!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to analyze resume')
      }
    } catch (error) {
      toast.error('Failed to analyze resume')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDownloadEnhanced = async (resume: Resume) => {
    try {
      const response = await fetch(`/api/resume/enhance/${resume.id}`, {
        method: 'POST',
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `enhanced_${resume.originalFileName}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Enhanced resume downloaded!')
      } else {
        toast.error('Failed to generate enhanced resume')
      }
    } catch (error) {
      toast.error('Failed to download enhanced resume')
    }
  }

  const handleDeleteResume = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) {
      return
    }

    try {
      const response = await fetch(`/api/resume/${resumeId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setResumes(prev => prev.filter(r => r.id !== resumeId))
        if (selectedResume?.id === resumeId) {
          setSelectedResume(null)
          setAnalysis(null)
        }
        toast.success('Resume deleted successfully!')
      } else {
        toast.error('Failed to delete resume')
      }
    } catch (error) {
      toast.error('Failed to delete resume')
    }
  }

  return (
    <AppShell>
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-foreground">Resume Assistant</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Upload Your Resume
              </h2>
              
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Drag and drop your resume here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports PDF and DOCX files up to 10MB
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="btn btn-primary btn-md"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="spinner mr-2" />
                      Uploading...
                    </div>
                  ) : (
                    'Choose File'
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
            </div>

            {/* Resume List */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Your Resumes
              </h3>
              
              {resumes.length === 0 ? (
                <div className="text-center py-8">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-muted-foreground">No resumes uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {resumes.map((resume) => (
                    <div
                      key={resume.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedResume?.id === resume.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedResume(resume)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">
                            {getFileTypeIcon(resume.originalFileName)}
                          </span>
                          <div>
                            <p className="font-medium text-foreground">
                              {resume.originalFileName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {typeof resume.atsScore === 'number' && (
                            <span className={`text-sm font-medium ${getATSScoreColor(resume.atsScore)}`}>
                              ATS: {resume.atsScore}%
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteResume(resume.id)
                            }}
                            className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Analysis Section */}
          <div className="space-y-6">
            {selectedResume ? (
              <>
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      Resume Analysis
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAnalyzeResume(selectedResume)}
                        disabled={isAnalyzing}
                        className="btn btn-primary btn-sm"
                      >
                        {isAnalyzing ? (
                          <div className="flex items-center">
                            <div className="spinner mr-2" />
                            Analyzing...
                          </div>
                        ) : (
                          'Analyze Resume'
                        )}
                      </button>
                      <button
                        onClick={() => handleDownloadEnhanced(selectedResume)}
                        className="btn btn-outline btn-sm flex items-center"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Enhanced
                      </button>
                    </div>
                  </div>

                  {analysis ? (
                    <div className="space-y-6">
                      {/* ATS Score */}
                      <div className="bg-muted rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground">ATS Score</h4>
                          <span className={`text-2xl font-bold ${getATSScoreColor(analysis.atsScore)}`}>
                            {analysis.atsScore}/100
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              analysis.atsScore >= 80 ? 'bg-green-500' :
                              analysis.atsScore >= 60 ? 'bg-yellow-500' :
                              analysis.atsScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${analysis.atsScore}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Suggestions */}
                      {analysis.suggestions.length > 0 && (
                        <div>
                          <h4 className="font-medium text-foreground mb-3 flex items-center">
                            <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-500" />
                            Improvement Suggestions
                          </h4>
                          <ul className="space-y-2">
                            {analysis.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start">
                                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-foreground">{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Missing Keywords */}
                      {analysis.missingKeywords.length > 0 && (
                        <div>
                          <h4 className="font-medium text-foreground mb-3 flex items-center">
                            <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-orange-500" />
                            Missing Keywords
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {analysis.missingKeywords.map((keyword, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-sm rounded-full"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Skill Gaps */}
                      {analysis.skillGaps.length > 0 && (
                        <div>
                          <h4 className="font-medium text-foreground mb-3 flex items-center">
                            <ChartBarIcon className="h-5 w-5 mr-2 text-blue-500" />
                            Skill Gaps
                          </h4>
                          <ul className="space-y-2">
                            {analysis.skillGaps.map((gap, index) => (
                              <li key={index} className="flex items-start">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                                <span className="text-foreground">{gap}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ChartBarIcon className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Click "Analyze Resume" to get AI-powered insights
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="card p-6">
                <div className="text-center py-8">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Select a Resume
                  </h3>
                  <p className="text-muted-foreground">
                    Choose a resume from the list to view analysis and get AI-powered suggestions
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
