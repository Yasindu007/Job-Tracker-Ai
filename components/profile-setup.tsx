'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon, UserIcon, BriefcaseIcon, CheckIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface ProfileSetupProps {
  onClose: () => void
  onComplete: () => void
}

const commonJobRoles = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Data Scientist',
  'Data Analyst',
  'Product Manager',
  'UX/UI Designer',
  'Marketing Manager',
  'Sales Representative',
  'Business Analyst',
  'Project Manager',
  'Quality Assurance Engineer',
  'Mobile Developer',
  'Cloud Engineer',
  'Cybersecurity Analyst',
  'Machine Learning Engineer',
  'Technical Writer',
  'Other'
]

const commonSkills = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'C#',
  'Go',
  'Rust',
  'React',
  'Vue.js',
  'Angular',
  'Node.js',
  'Express.js',
  'Django',
  'Flask',
  'Spring Boot',
  'Laravel',
  'Ruby on Rails',
  'HTML/CSS',
  'SQL',
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'Google Cloud',
  'Git',
  'Linux',
  'Agile',
  'Scrum',
  'Project Management',
  'Communication',
  'Leadership',
  'Problem Solving',
  'Analytical Thinking',
  'Teamwork',
  'Time Management'
]

export default function ProfileSetup({ onClose, onComplete }: ProfileSetupProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    expectedJobRole: '',
    skills: [] as string[],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [customJobRole, setCustomJobRole] = useState('')

  const handleJobRoleSelect = (role: string) => {
    if (role === 'Other') {
      setFormData(prev => ({ ...prev, expectedJobRole: customJobRole }))
    } else {
      setFormData(prev => ({ ...prev, expectedJobRole: role }))
    }
  }

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const handleNext = () => {
    if (step === 1 && !formData.expectedJobRole) {
      toast.error('Please select a job role')
      return
    }
    setStep(2)
  }

  const handleComplete = async () => {
    if (formData.skills.length === 0) {
      toast.error('Please select at least one skill')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expectedJobRole: formData.expectedJobRole,
          skills: formData.skills,
          isProfileComplete: true,
        }),
      })

      if (response.ok) {
        onComplete()
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

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
            Complete Your Profile
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}>
                {step > 1 ? <CheckIcon className="h-5 w-5" /> : '1'}
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}>
                2
              </div>
            </div>
          </div>

          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <BriefcaseIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  What's your target job role?
                </h3>
                <p className="text-muted-foreground">
                  This helps us provide better job recommendations and resume suggestions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {commonJobRoles.map((role) => (
                  <button
                    key={role}
                    onClick={() => handleJobRoleSelect(role)}
                    className={`p-3 text-left rounded-lg border transition-colors ${
                      formData.expectedJobRole === role
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              {formData.expectedJobRole === 'Other' && (
                <div>
                  <label htmlFor="customJobRole"                     className="block text-sm font-medium text-foreground mb-2">
                    Specify your job role
                  </label>
                  <input
                    type="text"
                    id="customJobRole"
                    value={customJobRole}
                    onChange={(e) => setCustomJobRole(e.target.value)}
                    className="input"
                    placeholder="Enter your job role"
                  />
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={!formData.expectedJobRole}
                  className="btn btn-primary btn-md"
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <UserIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  What are your skills?
                </h3>
                <p className="text-muted-foreground">
                  Select all skills that apply to you. This helps us calculate job fit scores.
                </p>
              </div>

              <div className="max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {commonSkills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => handleSkillToggle(skill)}
                      className={`p-3 text-sm rounded-lg border transition-colors ${
                        formData.skills.includes(skill)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {formData.skills.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Selected Skills ({formData.skills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="btn btn-outline btn-md"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={isLoading || formData.skills.length === 0}
                  className="btn btn-primary btn-md"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="spinner mr-2" />
                      Completing...
                    </div>
                  ) : (
                    'Complete Profile'
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
