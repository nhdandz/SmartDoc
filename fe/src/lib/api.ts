import { User, Document, OCRResult, SearchResult, ChatMessage, Report, ApiResponse } from '@/types'
import { convertBackendDocument, convertBackendOCRResult, convertBackendChatMessage, safeArrayConvert, hasResponseData } from './apiUtils'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    console.log(`API Request: ${endpoint}`, {
      method: config.method || 'GET',
      headers: config.headers,
      hasBody: !!config.body
    })

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
      
      console.log(`API Response: ${endpoint}`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      // Handle different content types
      let data
      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }
      
      if (!response.ok) {
        console.error(`API Error: ${endpoint}`, data)
        return {
          success: false,
          error: data.detail || data.message || `HTTP ${response.status}: ${response.statusText}`
        }
      }
      
      return { success: true, data }
    } catch (error) {
      console.error(`API Network Error: ${endpoint}`, error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Lỗi kết nối đến server' 
      }
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse<{ token: string, user: User }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: {
    name: string
    email: string
    password: string
    role?: string
  }): Promise<ApiResponse<{ token: string, user: User }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async logout(): Promise<ApiResponse> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    return { success: true }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request('/auth/me')
  }

  // Documents endpoints
  async getDocuments(params?: {
    page?: number
    limit?: number
    search?: string
    type_filter?: string
  }): Promise<ApiResponse<{
    documents: Document[]
    total: number
    page: number
    limit: number
    pages: number
  }>> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.search) searchParams.set('search', params.search)
    if (params?.type_filter) searchParams.set('type_filter', params.type_filter)
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
    const response = await this.request<{
      documents: any[]
      total: number
      page: number
      limit: number
      pages: number
    }>(`/documents${query}`)
    
    // Convert backend documents to frontend format
    if (response.success && response.data?.documents) {
      const convertedDocuments = safeArrayConvert(response.data.documents, convertBackendDocument)
      return {
        success: true,
        data: {
          documents: convertedDocuments,
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          pages: response.data.pages
        }
      }
    }
    
    return {
      success: false,
      error: response.error || 'Failed to load documents'
    }
  }

  async uploadDocument(file: File): Promise<ApiResponse<Document>> {
    const formData = new FormData()
    formData.append('file', file)

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    console.log('Uploading file:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    try {
      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      })

      console.log('Upload response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error('Upload error:', data)
        return {
          success: false,
          error: data.detail || data.message || 'Upload failed'
        }
      }

      // Convert backend document format
      try {
        const convertedDocument = convertBackendDocument(data)
        return { success: true, data: convertedDocument }
      } catch (conversionError) {
        console.error('Document conversion error:', conversionError)
        // Fallback: return data as is with type assertion
        return { success: true, data: data as Document }
      }
    } catch (error) {
      console.error('Upload network error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }

  async deleteDocument(id: string): Promise<ApiResponse> {
    return this.request(`/documents/${id}`, { method: 'DELETE' })
  }

  async shareDocument(id: string, shareData: { user_email: string, permission: string }): Promise<ApiResponse> {
    return this.request(`/documents/${id}/share`, {
      method: 'POST',
      body: JSON.stringify(shareData),
    })
  }

  // OCR endpoints
  async processOCR(file: File): Promise<ApiResponse<OCRResult>> {
    const formData = new FormData()
    formData.append('file', file)

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    try {
      const response = await fetch(`${API_BASE_URL}/ocr/process`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      })

      const data = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.message || 'OCR processing failed'
        }
      }

      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OCR processing failed'
      }
    }
  }

  async getOCRResults(): Promise<ApiResponse<OCRResult[]>> {
    return this.request('/ocr/results')
  }

  async getOCRResult(id: string): Promise<ApiResponse<OCRResult>> {
    return this.request(`/ocr/results/${id}`)
  }

  async updateOCRResult(id: string, updateData: { extracted_text?: string, confidence?: number }): Promise<ApiResponse> {
    return this.request(`/ocr/results/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    })
  }

  // Search endpoints
  async searchDocuments(searchData: {
    query: string
    filters?: any
    page?: number
    limit?: number
  }): Promise<ApiResponse<{
    results: SearchResult[]
    total: number
    page: number
    limit: number
    query: string
    took: number
  }>> {
    return this.request('/search', {
      method: 'POST',
      body: JSON.stringify(searchData),
    })
  }

  async getSearchSuggestions(query: string): Promise<ApiResponse<string[]>> {
    return this.request(`/search/suggestions?q=${encodeURIComponent(query)}`)
  }

  // QA endpoints
  async askQuestion(questionData: {
    question: string
    context?: string[]
    session_id?: string
  }): Promise<ApiResponse<ChatMessage>> {
    return this.request('/qa/ask', {
      method: 'POST',
      body: JSON.stringify(questionData),
    })
  }

  async getQAHistory(): Promise<ApiResponse<any[]>> {
    return this.request('/qa/history')
  }

  async createChatSession(sessionData: { title: string }): Promise<ApiResponse<any>> {
    return this.request('/qa/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    })
  }

  async getChatSession(id: string): Promise<ApiResponse<any>> {
    return this.request(`/qa/sessions/${id}`)
  }

  // Reports endpoints
  async generateReport(config: any): Promise<ApiResponse<Report>> {
    return this.request('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(config),
    })
  }

  async getReports(): Promise<ApiResponse<Report[]>> {
    return this.request('/reports')
  }

  async getReport(id: string): Promise<ApiResponse<Report>> {
    return this.request(`/reports/${id}`)
  }

  async downloadReport(id: string): Promise<ApiResponse<any>> {
    return this.request(`/reports/${id}/download`)
  }

  // Settings endpoints
  async getSettings(): Promise<ApiResponse<any>> {
    return this.request('/settings')
  }

  async updateSettings(settings: any): Promise<ApiResponse> {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  }

  // Dashboard stats
  async getDashboardStats(): Promise<ApiResponse<{
    total_documents: number
    total_ocr_processed: number
    total_questions: number
    total_reports: number
    recent_documents: any[]
    recent_questions: any[]
  }>> {
    return this.request('/stats/dashboard')
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request('/', { 
      headers: {
        // Remove auth header for health check
      }
    })
  }
}

export const apiService = new ApiService()