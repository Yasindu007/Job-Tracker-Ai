'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  BriefcaseIcon, 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

export default function LandingPage() {
  const features = [
    {
      icon: BriefcaseIcon,
      title: 'Job Application Tracking',
      description: 'Organize and track all your job applications in one place with status updates and interview scheduling.',
    },
    {
      icon: DocumentTextIcon,
      title: 'AI Resume Enhancement',
      description: 'Upload your resume and get AI-powered suggestions to optimize it for ATS systems and specific roles.',
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Interview Preparation',
      description: 'Get personalized interview questions and preparation strategies based on job postings.',
    },
    {
      icon: ChartBarIcon,
      title: 'Job Fit Scoring',
      description: 'See how well your skills match job requirements with our AI-powered fit scoring system.',
    },
  ]

  const benefits = [
    'Track applications across multiple platforms',
    'Optimize resumes for ATS systems',
    'Prepare for interviews with AI insights',
    'Identify skill gaps and improvement areas',
    'Schedule interviews with calendar integration',
    'Get personalized career recommendations',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BriefcaseIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">JobTracker AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="btn btn-primary btn-md"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Land Your Dream Job with{' '}
              <span className="text-blue-600">AI-Powered</span> Tools
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              Track applications, optimize your resume, and prepare for interviews with our comprehensive AI assistant. 
              Get personalized insights to accelerate your job search.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/auth/register"
                className="btn btn-primary btn-lg inline-flex items-center"
              >
                Start Free Trial
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="#features"
                className="btn btn-outline btn-lg"
              >
                Learn More
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Job Search Success
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform combines job tracking, resume optimization, and interview preparation in one comprehensive tool.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card p-6 text-center hover:shadow-lg transition-shadow"
              >
                <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose JobTracker AI?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Our platform uses advanced AI to provide personalized insights and recommendations, 
                helping you stand out in today's competitive job market.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-center"
                  >
                    <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-lg shadow-xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Job Fit Score</span>
                    <span className="text-2xl font-bold text-green-600">87%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Matched Skills</span>
                      <span className="text-green-600">12/15</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>ATS Score</span>
                      <span className="text-blue-600">92/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Interview Prep</span>
                      <span className="text-purple-600">Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Accelerate Your Job Search?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of job seekers who have successfully landed their dream jobs with our AI-powered platform.
          </p>
          <Link
            href="/auth/register"
            className="btn bg-white text-blue-600 hover:bg-gray-100 btn-lg inline-flex items-center"
          >
            Get Started Today
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <BriefcaseIcon className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold">JobTracker AI</span>
            </div>
            <div className="text-gray-400">
              © 2024 JobTracker AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
