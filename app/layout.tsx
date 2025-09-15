import type { Metadata } from 'next'
import { StackProvider, StackTheme } from "@stackframe/stack";
import { client } from "@/stack"; // Import client from the client-side stack.ts
import { stackServerApp } from "../stack/server"; // Corrected import path
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Job Tracker & AI Resume Assistant',
  description: 'Track job applications, enhance resumes with AI, and prepare for interviews',
  keywords: ['job tracker', 'resume', 'AI', 'interview prep', 'career'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StackProvider app={client}> {/* Use client from stack.ts */}
          <StackTheme>
            <Providers>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
            </Providers>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  )
}
