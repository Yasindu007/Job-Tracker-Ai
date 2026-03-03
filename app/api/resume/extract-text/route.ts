import { NextResponse } from 'next/server'
import { auth } from '@/stack'
import { extractTextFromFile } from '@/lib/file-processing'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const user = await auth.getUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    try {
      const { text } = await extractTextFromFile(file)
      return NextResponse.json({ text })
    } catch (parseError) {
      console.error('File parsing error:', parseError)
      if (parseError instanceof Error && parseError.message.includes('Unsupported file type')) {
        return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
      }
      if (file.type === 'application/pdf') {
        return NextResponse.json({ error: 'Failed to parse PDF. Please ensure the file is not corrupted.' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Failed to parse document.' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error extracting text:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
