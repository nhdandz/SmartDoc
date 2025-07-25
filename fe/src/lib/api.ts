import { User, Document, OCRResult, SearchResult, ChatMessage, Report, ApiResponse } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('token')
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('API request failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
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

  async logout(): Promise<ApiResponse> {
    return this.request('/auth/logout', { method: 'POST' })
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request('/auth/me')
  }

  // Documents endpoints
  async getDocuments(params?: Record<string, string>): Promise<ApiResponse<Document[]>> {
    const query = params ? `?${new URLSearchParams(params)}` : ''
    return this.request(`/documents${query}`)
  }

  async uploadDocument(file: File, metadata?: any): Promise<ApiResponse<Document>> {
    const formData = new FormData()
    formData.append('file', file)
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata))
    }

    return this.request('/documents/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it with boundary
    })
  }

  async deleteDocument(id: string): Promise<ApiResponse> {
    return this.request(`/documents/${id}`, { method: 'DELETE' })
  }

  // OCR endpoints
  async processOCR(file: File): Promise<ApiResponse<OCRResult>> {
    const formData = new FormData()
    formData.append('file', file)

    return this.request('/ocr/process', {
      method: 'POST',
      body: formData,
      headers: {},
    })
  }

  async getOCRResults(): Promise<ApiResponse<OCRResult[]>> {
    return this.request('/ocr/results')
  }

  // Search endpoints
  async searchDocuments(query: string, filters?: any): Promise<ApiResponse<SearchResult[]>> {
    return this.request('/search', {
      method: 'POST',
      body: JSON.stringify({ query, filters }),
    })
  }

  // QA endpoints
  async askQuestion(question: string, context?: string[]): Promise<ApiResponse<ChatMessage>> {
    return this.request('/qa/ask', {
      method: 'POST',
      body: JSON.stringify({ question, context }),
    })
  }

  async getQAHistory(): Promise<ApiResponse<ChatMessage[]>> {
    return this.request('/qa/history')
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

  async downloadReport(id: string): Promise<ApiResponse<Blob>> {
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
}

export const apiService = new ApiService()
