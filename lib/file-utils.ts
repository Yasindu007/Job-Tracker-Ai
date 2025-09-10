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

    if (!extractedText.trim()) {
      return {
        success: false,
        error: 'No text could be extracted from the file',
        fileName: file.name,
        fileSize: file.size,
      }
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

export function validateFileType(file: File): boolean {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ]
  return allowedTypes.includes(file.type)
}

export function validateFileSize(file: File): boolean {
  const maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760') // 10MB
  return file.size <= maxSize
}

export function getFileTypeIcon(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'pdf':
      return '📄'
    case 'docx':
    case 'doc':
      return '📝'
    default:
      return '📁'
  }
}

export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now()
  const sanitizedName = sanitizeFileName(originalName)
  const extension = sanitizedName.split('.').pop()
  const nameWithoutExt = sanitizedName.replace(/\.[^/.]+$/, '')
  
  return `${nameWithoutExt}_${timestamp}.${extension}`
}
