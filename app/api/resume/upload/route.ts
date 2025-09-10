import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { generateUniqueFileName } from '@/lib/file-utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const extractedText = formData.get('extractedText') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads', 'resumes')
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const uniqueFileName = generateUniqueFileName(file.name)
    const filePath = join(uploadsDir, uniqueFileName)

    // Save file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Save resume record to database
    const resume = await prisma.resume.create({
      data: {
        originalFileName: file.name,
        filePath: filePath,
        extractedText: extractedText || null,
        userId: session.user.id,
      },
    })

    return NextResponse.json(resume)
  } catch (error) {
    console.error('Error uploading resume:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
