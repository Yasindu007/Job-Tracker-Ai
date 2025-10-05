import { NextResponse } from 'next/server'
import { auth } from '@/stack'
import { prisma } from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import path from 'path'
import os from 'os'

export async function POST(request: Request) {
  try {
    const user = await auth.getUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    const extractedText: string | null = data.get('extractedText') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Use a serverless-safe temp directory
    const uploadsDir = path.join(os.tmpdir(), 'uploads')
    const filePath = path.join(uploadsDir, `${Date.now()}_${file.name}`)

    // Ensure the uploads directory exists
    await require('fs').promises.mkdir(uploadsDir, { recursive: true });

    await writeFile(filePath, buffer)

    const newResume = await prisma.resume.create({
      data: {
        userId: user.id,
        originalFileName: file.name,
        // Store the temp file path for reference; not served publicly in serverless
        filePath: filePath,
        fileSize: file.size,
        extractedText: extractedText || '',
      },
    })

    return NextResponse.json(newResume)
  } catch (error) {
    console.error('Error uploading resume:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}