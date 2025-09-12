import pdf from 'pdf-parse'
import mammoth from 'mammoth'
import { sanitizeFileName, formatFileSize } from '@/lib/utils'

export interface FileUploadResult {
  success: boolean
  text?: string
  error?: string
  fileName: string
  fileSize: number
}

export async function extractTextFromFile(file: File): Promise<FileUploadResult> {
  const maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760') // 10MB
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
  
  if (file.size > maxSize) {
    return {
      success: false,
      error: `File size exceeds limit of ${formatFileSize(maxSize)}`,
      fileName: file.name,
      fileSize: file.size,
    }
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: 'Only PDF and DOCX files are allowed',
      fileName: file.name,
      fileSize: file.size,
    }
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    let extractedText = ''

    if (file.type === 'application/pdf') {
      const pdfData = await pdf(Buffer.from(arrayBuffer))
      extractedText = pdfData.text
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               file.type === 'application/msword') {
      const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) })
      extractedText = result.value
    }

    return {
      success: true,
      text: extractedText,
      fileName: sanitizeFileName(file.name),
      fileSize: file.size,
    }
  } catch (error) {
    return {
      success: false,
      error: `Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      fileName: file.name,
      fileSize: file.size,
    }
  }
}