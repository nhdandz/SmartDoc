// src/lib/apiUtils.ts
import { Document, OCRResult, ChatMessage } from '@/types'

/**
 * Convert backend document format to frontend format
 */
export function convertBackendDocument(backendDoc: any): Document {
  if (!backendDoc || typeof backendDoc !== 'object') {
    throw new Error('Invalid document data')
  }

  return {
    id: backendDoc.id || '',
    name: backendDoc.name || 'Unknown Document',
    original_name: backendDoc.original_name || backendDoc.name,
    type: backendDoc.type || 'Unknown',
    size: backendDoc.size || '0 KB',
    upload_date: backendDoc.upload_date || new Date().toISOString(),
    uploadDate: new Date(backendDoc.upload_date || backendDoc.uploadDate || Date.now()),
    author: backendDoc.author,
    folder: backendDoc.folder,
    file_path: backendDoc.file_path,
    shared: backendDoc.shared || false,
    is_processed: backendDoc.is_processed || false,
    is_owner: backendDoc.is_owner !== false, // Default to true if not specified
    doc_metadata: backendDoc.doc_metadata || backendDoc.metadata || {},
  }
}

/**
 * Convert backend OCR result to frontend format
 */
export function convertBackendOCRResult(backendResult: any): OCRResult {
  return {
    id: backendResult.id,
    document_id: backendResult.document_id,
    user_id: backendResult.user_id,
    original_file: backendResult.original_file,
    originalFile: backendResult.original_file, // Backwards compatibility
    extracted_text: backendResult.extracted_text,
    extractedText: backendResult.extracted_text, // Backwards compatibility
    confidence: backendResult.confidence,
    process_date: backendResult.process_date,
    processDate: new Date(backendResult.process_date), // Backwards compatibility
    status: backendResult.status,
    engine_used: backendResult.engine_used,
    language: backendResult.language,
    ocr_metadata: backendResult.ocr_metadata || backendResult.metadata,
  }
}

/**
 * Convert backend chat message to frontend format
 */
export function convertBackendChatMessage(backendMessage: any): ChatMessage {
  return {
    id: backendMessage.id,
    type: backendMessage.type,
    content: backendMessage.content,
    timestamp: typeof backendMessage.timestamp === 'string' 
      ? new Date(backendMessage.timestamp) 
      : backendMessage.timestamp,
    sources: backendMessage.sources,
    rating: backendMessage.rating,
    session_id: backendMessage.session_id,
  }
}

/**
 * Safe array conversion with type checking
 */
export function safeArrayConvert<T>(
  data: any, 
  converter: (item: any) => T
): T[] {
  if (!Array.isArray(data)) {
    console.warn('Expected array but got:', typeof data, data)
    return []
  }
  
  return data.map((item, index) => {
    try {
      return converter(item)
    } catch (error) {
      console.error(`Error converting item at index ${index}:`, error, item)
      throw error // Re-throw to handle at higher level
    }
  })
}

/**
 * Safe object property access with fallback
 */
export function safeGet<T>(obj: any, path: string, fallback: T): T {
  try {
    const value = path.split('.').reduce((current, key) => current?.[key], obj)
    return value !== undefined && value !== null ? value : fallback
  } catch {
    return fallback
  }
}

/**
 * Format date safely
 */
export function formatDateSafe(dateInput: string | Date | undefined, locale = 'vi-VN'): string {
  if (!dateInput) return 'N/A'
  
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    if (isNaN(date.getTime())) return 'Invalid Date'
    return date.toLocaleDateString(locale)
  } catch {
    return String(dateInput)
  }
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number | string): string {
  if (typeof bytes === 'string') {
    // If already formatted (like "2.4 MB"), return as is
    if (bytes.includes('B')) return bytes
    // Try to parse as number
    const parsed = parseFloat(bytes)
    if (isNaN(parsed)) return bytes
    bytes = parsed
  }
  
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Type guard to check if response has data
 */
export function hasResponseData<T>(response: { success: boolean; data?: T }): response is { success: true; data: T } {
  return response.success && response.data !== undefined
}

/**
 * Handle API response with proper error handling
 */
export function handleApiResponse<T>(
  response: { success: boolean; data?: T; error?: string },
  onSuccess: (data: T) => void,
  onError?: (error: string) => void
): boolean {
  if (hasResponseData(response)) {
    onSuccess(response.data)
    return true
  } else {
    const error = response.error || 'Unknown error occurred'
    console.error('API Error:', error)
    onError?.(error)
    return false
  }
}