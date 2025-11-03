'use client'

import { ReactNode } from 'react'
import Navigation from './navigation'

interface AppShellProps {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation />
      <div className="lg:ml-64">
        {children}
      </div>
    </div>
  )
}
