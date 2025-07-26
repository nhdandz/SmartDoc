'use client'
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Search, 
  Upload, 
  FileText, 
  MessageSquare,
  Mic,
  MoreHorizontal,
  Settings,
  Share,
  Bell,
  User,
  Play,
  Edit3,
  BookOpen,
  HelpCircle,
  Clock,
  Menu,
  X,
  Send,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { apiService } from '@/lib/api'
import { ChatMessage } from '@/types'

type TabType = 'sources' | 'chat' | 'studio'

interface Source {
  id: string
  name: string
  type: string
  size: string
  uploadDate: Date
  status: 'processing' | 'ready' | 'error'
}

export default function Dashboard() {
  const router = useRouter()
  const [sources, setSources] = useState<Source[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatMessage, setChatMessage] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('sources')
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({})
  const [dashboardStats, setDashboardStats] = useState<any>(null)

  // Load dashboard data
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const response = await apiService.getDashboardStats()
      if (response.success && response.data) {
        const data = response.data
        setDashboardStats(data)
        
        // Convert recent documents to sources format with safe access
        const recentDocs = data.recent_documents
        if (recentDocs && Array.isArray(recentDocs)) {
          const documentSources = recentDocs.map((doc: any) => ({
            id: doc.id || `doc-${Date.now()}-${Math.random()}`,
            name: doc.name || 'Unknown Document',
            type: doc.type || 'Document',
            size: doc.size || '0 KB',
            uploadDate: new Date(doc.upload_date || doc.uploadDate || Date.now()),
            status: 'ready' as const
          }))
          setSources(documentSources)
        }
      } else {
        console.log('Dashboard stats not available:', response.error)
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    }
  }

  // File upload handler - now using real API
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setIsUploading(true)
    
    const uploadPromises = acceptedFiles.map(async (file) => {
      try {
        console.log('Uploading file:', file.name)
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
        
        // Create temporary source entry
        const tempSource: Source = {
          id: `temp-${Date.now()}-${Math.random()}`,
          name: file.name,
          type: file.type.includes('pdf') ? 'PDF' : 
                file.type.includes('image') ? 'Image' :
                file.type.includes('audio') ? 'Audio' : 'Document',
          size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          uploadDate: new Date(),
          status: 'processing'
        }
        
        setSources(prev => [tempSource, ...prev])
        
        // Upload via API
        const response = await apiService.uploadDocument(file)
        
        if (response.success && response.data) {
          console.log('Upload successful:', response.data)
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
          
          // Update source with real data
          setSources(prev => prev.map(source => 
            source.id === tempSource.id 
              ? {
                  ...source,
                  id: response.data!.id,
                  status: 'ready' as const,
                  size: response.data!.size || source.size
                }
              : source
          ))
          
          toast.success(`Tải lên ${file.name} thành công!`)
        } else {
          console.error('Upload failed:', response.error)
          // Update source to error state
          setSources(prev => prev.map(source => 
            source.id === tempSource.id 
              ? { ...source, status: 'error' as const }
              : source
          ))
          toast.error(`Lỗi tải lên ${file.name}: ${response.error}`)
        }
      } catch (error) {
        console.error('Upload error:', error)
        toast.error(`Lỗi tải lên ${file.name}`)
        
        // Update source to error state
        setSources(prev => prev.map(source => 
          source.name === file.name && source.status === 'processing'
            ? { ...source, status: 'error' as const }
            : source
        ))
      } finally {
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[file.name]
          return newProgress
        })
      }
    })

    try {
      await Promise.all(uploadPromises)
    } finally {
      setIsUploading(false)
      setShowUpload(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'audio/*': ['.mp3', '.wav', '.m4a'],
      'image/*': ['.jpg', '.jpeg', '.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    disabled: isUploading
  })

  // Chat handler - enhanced with real context and proper type safety
  const handleSendMessage = async () => {
    if (!chatMessage.trim() || isSendingMessage) return
    if (sources.filter(s => s.status === 'ready').length === 0) {
      toast.error('Vui lòng tải lên ít nhất một nguồn trước khi chat!')
      return
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatMessage,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    const currentQuestion = chatMessage
    setChatMessage('')
    setIsSendingMessage(true)

    try {
      // Get ready source IDs for context
      const readySourceIds = sources
        .filter(s => s.status === 'ready')
        .map(s => s.id)
      
      const response = await apiService.askQuestion({
        question: currentQuestion,
        context: readySourceIds
      })

      if (response.success && response.data) {
        // Type guard to ensure we have the required data
        const responseData = response.data
        
        const aiMessage: ChatMessage = {
          id: responseData.id || (Date.now() + 1).toString(),
          type: 'assistant',
          content: responseData.content || 'Không có phản hồi từ hệ thống.',
          timestamp: responseData.timestamp 
            ? (typeof responseData.timestamp === 'string' 
                ? new Date(responseData.timestamp) 
                : responseData.timestamp)
            : new Date(),
          sources: responseData.sources,
          rating: responseData.rating,
          session_id: responseData.session_id
        }
        setChatMessages(prev => [...prev, aiMessage])
      } else {
        // Fallback to mock response if API fails
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: `Dựa trên ${sources.filter(s => s.status === 'ready').length} nguồn đã tải lên, tôi đang xử lý câu hỏi: "${currentQuestion}".\n\nHiện tại hệ thống AI đang được cấu hình. Vui lòng thử lại sau.`,
          timestamp: new Date()
        }
        setChatMessages(prev => [...prev, aiMessage])
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Xin lỗi, tôi không thể trả lời câu hỏi này lúc này. Vui lòng thử lại sau.',
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsSendingMessage(false)
    }
  }

  // Audio overview handler
  const handleGenerateAudio = () => {
    if (sources.filter(s => s.status === 'ready').length === 0) {
      toast.error('Vui lòng tải lên ít nhất một nguồn trước!')
      return
    }
    
    setIsGeneratingAudio(true)
    toast.success('Đang tạo tổng quan bằng âm thanh...')
    
    setTimeout(() => {
      setIsGeneratingAudio(false)
      toast.success('Tổng quan âm thanh đã được tạo!')
    }, 5000)
  }

  // Navigation handlers
  const handleExplore = () => {
    router.push('/dashboard/search')
  }

  const handleCreateNote = () => {
    if (sources.filter(s => s.status === 'ready').length === 0) {
      toast.error('Vui lòng tải lên ít nhất một nguồn trước!')
      return
    }
    router.push('/dashboard/reports')
  }

  const handleViewAllDocuments = () => {
    router.push('/dashboard/documents')
  }

  const handleSettings = () => {
    router.push('/dashboard/settings')
  }

  const readySources = sources.filter(s => s.status === 'ready')
  const canChat = readySources.length > 0
  const canUseStudio = readySources.length > 0

  return (
    <div className="h-screen bg-gray-100 flex flex-col" style={{ background: '#edeffa' }}>
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <h1 className="text-lg lg:text-xl font-medium text-gray-900 truncate">SmartDoc Notebook</h1>
        </div>
        
        {/* Header Actions */}
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="hidden sm:block bg-white px-3 py-1 rounded border text-xs font-medium">
            🎉 Mới! Tải lên tài liệu thật
          </div>
          <button 
            onClick={() => toast('Tính năng chia sẻ sẽ sớm có!')}
            className="btn-round btn-secondary text-xs lg:text-sm"
          >
            <Share className="w-4 h-4" />
            <span className="hidden sm:inline">Chia sẻ</span>
          </button>
          <button 
            onClick={handleSettings}
            className="btn-round btn-secondary text-xs lg:text-sm"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Cài đặt</span>
          </button>
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-300 rounded-full"></div>
        </div>
      </header>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Đang tải lên</h3>
            <div className="space-y-2">
              {Object.entries(uploadProgress).map(([filename, progress]) => (
                <div key={filename}>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span className="truncate">{filename}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex">
          <button
            onClick={() => setActiveTab('sources')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'sources'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Nguồn ({sources.length})
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'chat'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Cuộc trò chuyện
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'studio'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Studio
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop: 3 Panels */}
        <div className="hidden lg:flex gap-4 p-4 w-full">
          {/* Panel 1: Sources */}
          <div className="w-[480px] panel">
            {/* Sources Header */}
            <div className="panel-header">
              <h2 className="font-medium text-gray-900">Nguồn ({sources.length})</h2>
              <div className="ml-auto">
                <button 
                  onClick={handleViewAllDocuments}
                  className="icon-btn"
                >
                  <MoreHorizontal className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* Sources Content */}
            <div className="p-4 h-full flex flex-col">
              {/* Action Buttons */}
              <div className="flex gap-2 mb-6">
                <button 
                  className="btn-round btn-ghost flex-1"
                  onClick={() => setShowUpload(true)}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {isUploading ? 'Đang tải...' : 'Thêm'}
                </button>
                <button 
                  onClick={handleExplore}
                  className="btn-round btn-ghost flex-1"
                >
                  <Search className="w-4 h-4" />
                  Khám phá
                </button>
              </div>

              {/* Sources List */}
              {sources.length > 0 ? (
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {sources.map((source) => (
                    <div key={source.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          source.status === 'processing' ? 'animate-spin' : ''
                        }`}>
                          {source.status === 'processing' ? (
                            <Loader2 className="w-5 h-5 text-blue-600" />
                          ) : source.status === 'error' ? (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          ) : (
                            <FileText className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{source.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <span>{source.size}</span>
                            <span>•</span>
                            <span>{source.type}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              source.status === 'ready' ? 'bg-green-100 text-green-700' :
                              source.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {source.status === 'ready' ? 'Sẵn sàng' :
                               source.status === 'processing' ? 'Đang xử lý' : 'Lỗi'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4 opacity-60">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed max-w-sm opacity-60">
                    Các nguồn đã lưu sẽ xuất hiện ở đây<br />
                    Nhấp vào "Thêm nguồn" ở trên để thêm tệp PDF, trang web, văn bản, video hoặc tệp âm thanh.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Panel 2: Chat */}
          <div className="flex-1 panel">
            {/* Chat Header */}
            <div className="panel-header">
              <h2 className="font-medium text-gray-900">Cuộc trò chuyện</h2>
            </div>
            
            {/* Chat Content */}
            <div className="flex-1 flex flex-col">
              {/* Chat Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto">
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-center max-w-md">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-normal text-gray-900 mb-6">
                        {sources.length === 0 ? 'Thêm một nguồn để bắt đầu' : 'Bắt đầu cuộc trò chuyện'}
                      </h3>
                      {sources.length === 0 ? (
                        <button 
                          className="btn-round btn-secondary"
                          onClick={() => setShowUpload(true)}
                          disabled={isUploading}
                        >
                          Tải nguồn lên
                        </button>
                      ) : (
                        <p className="text-gray-600">Hãy đặt câu hỏi về các tài liệu đã tải lên</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] p-3 rounded-lg ${
                          message.type === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {(typeof message.timestamp === 'string' ? new Date(message.timestamp) : message.timestamp).toLocaleTimeString('vi-VN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isSendingMessage && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-100">
                <div className="bg-white rounded-2xl border border-gray-200 p-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder={canChat ? "Hỏi về các tài liệu đã tải lên..." : "Tải một nguồn lên để bắt đầu"}
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 text-gray-900 bg-transparent outline-none"
                      disabled={!canChat || isSendingMessage}
                    />
                    <span className="text-xs text-gray-400">{readySources.length} nguồn</span>
                    <button 
                      onClick={handleSendMessage}
                      disabled={!canChat || !chatMessage.trim() || isSendingMessage}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        canChat && chatMessage.trim() && !isSendingMessage
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-gray-300'
                      }`}
                    >
                      {isSendingMessage ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <Send className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 3: Studio */}
          <div className="w-[480px] panel">
            {/* Studio Header */}
            <div className="panel-header">
              <h2 className="font-medium text-gray-900">Studio</h2>
              <div className="ml-auto">
                <button className="icon-btn">
                  <MoreHorizontal className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* Studio Content */}
            <div className="p-4 space-y-6 overflow-y-auto">
              {/* Audio Overview Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-medium text-gray-900">Tổng quan bằng âm thanh</h3>
                  <button className="icon-btn">
                    <MoreHorizontal className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                
                {/* Feature Banner */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <span className="text-sm">🎉</span>
                    <div>
                      <p className="text-xs font-medium text-gray-900">
                        Tạo bản Tổng quan bằng âm thanh ở nhiều ngôn ngữ hơn!
                      </p>
                      <button className="text-xs text-blue-600 hover:underline mt-1">
                        Tìm hiểu thêm
                      </button>
                    </div>
                  </div>
                </div>

                {/* Audio Card */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mic className="w-5 h-5 text-gray-700" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 mb-3">
                        Cuộc trò chuyện tìm hiểu chuyên sâu<br />
                        Hai người dẫn dắt
                      </p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => toast('Tính năng tùy chỉnh sẽ sớm có!')}
                          disabled={!canUseStudio}
                          className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                            canUseStudio 
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          Tuỳ chỉnh
                        </button>
                        <button 
                          onClick={handleGenerateAudio}
                          disabled={!canUseStudio || isGeneratingAudio}
                          className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                            canUseStudio && !isGeneratingAudio
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : 'bg-gray-300 text-gray-500'
                          }`}
                        >
                          {isGeneratingAudio ? 'Đang tạo...' : 'Tạo'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-medium text-gray-900">Ghi chú</h3>
                  <button className="icon-btn">
                    <MoreHorizontal className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Notes Actions */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <button 
                    onClick={handleCreateNote}
                    disabled={!canUseStudio}
                    className={`btn-round btn-ghost justify-center transition-all ${
                      canUseStudio ? 'hover:bg-gray-100' : 'opacity-60'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    Thêm ghi chú
                  </button>
                  <button 
                    onClick={() => router.push('/dashboard/qa')}
                    disabled={!canUseStudio}
                    className={`btn-round btn-ghost justify-center transition-all ${
                      canUseStudio ? 'hover:bg-gray-100' : 'opacity-60'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Hướng dẫn học tập
                  </button>
                  <button 
                    onClick={handleCreateNote}
                    disabled={!canUseStudio}
                    className={`btn-round btn-ghost justify-center transition-all ${
                      canUseStudio ? 'hover:bg-gray-100' : 'opacity-60'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Tài liệu tóm tắt
                  </button>
                  <button 
                    onClick={() => router.push('/dashboard/qa')}
                    disabled={!canUseStudio}
                    className={`btn-round btn-ghost justify-center transition-all ${
                      canUseStudio ? 'hover:bg-gray-100' : 'opacity-60'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4" />
                    Câu hỏi thường gặp
                  </button>
                  <button 
                    onClick={() => toast('Tính năng dòng thời gian sẽ sớm có!')}
                    disabled={!canUseStudio}
                    className={`btn-round btn-ghost justify-center col-span-2 transition-all ${
                      canUseStudio ? 'hover:bg-gray-100' : 'opacity-60'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    Dòng thời gian
                  </button>
                </div>

                {/* Notes Empty State */}
                <div className="text-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 opacity-60">
                    <Edit3 className="w-7 h-7 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed opacity-60">
                    Những ghi chú đã lưu sẽ xuất hiện ở đây<br />
                    Lưu tin nhắn trò chuyện để tạo một ghi chú mới hoặc nhấp vào nút Thêm ghi chú ở trên.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Single Panel views */}
        <div className="lg:hidden flex-1 flex flex-col">
          {/* Sources Panel */}
          {activeTab === 'sources' && (
            <div className="flex-1 bg-white mx-4 my-4 rounded-2xl overflow-hidden">
              <div className="p-4 h-full flex flex-col">
                <div className="flex gap-2 mb-6">
                  <button 
                    className="btn-round btn-ghost flex-1"
                    onClick={() => setShowUpload(true)}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {isUploading ? 'Đang tải...' : 'Thêm'}
                  </button>
                  <button 
                    onClick={handleExplore}
                    className="btn-round btn-ghost flex-1"
                  >
                    <Search className="w-4 h-4" />
                    Khám phá
                  </button>
                </div>

                {sources.length > 0 ? (
                  <div className="flex-1 space-y-3 overflow-y-auto">
                    {sources.map((source) => (
                      <div key={source.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            source.status === 'processing' ? 'animate-spin' : ''
                          }`}>
                            {source.status === 'processing' ? (
                              <Loader2 className="w-5 h-5 text-blue-600" />
                            ) : source.status === 'error' ? (
                              <AlertCircle className="w-5 h-5 text-red-600" />
                            ) : (
                              <FileText className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{source.name}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <span>{source.size}</span>
                              <span>•</span>
                              <span>{source.type}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                source.status === 'ready' ? 'bg-green-100 text-green-700' :
                                source.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {source.status === 'ready' ? 'Sẵn sàng' :
                                 source.status === 'processing' ? 'Đang xử lý' : 'Lỗi'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4 opacity-60">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed opacity-60">
                      Các nguồn đã lưu sẽ xuất hiện ở đây<br />
                      Nhấp vào "Thêm nguồn" ở trên để thêm tệp PDF, trang web, văn bản, video hoặc tệp âm thanh.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chat Panel */}
          {activeTab === 'chat' && (
            <div className="flex-1 bg-white mx-4 my-4 rounded-2xl overflow-hidden flex flex-col">
              <div className="flex-1 p-4 overflow-y-auto">
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-center max-w-md">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-normal text-gray-900 mb-6">
                        {sources.length === 0 ? 'Thêm một nguồn để bắt đầu' : 'Bắt đầu cuộc trò chuyện'}
                      </h3>
                      {sources.length === 0 ? (
                        <button 
                          className="btn-round btn-secondary"
                          onClick={() => setShowUpload(true)}
                          disabled={isUploading}
                        >
                          Tải nguồn lên
                        </button>
                      ) : (
                        <p className="text-gray-600">Hãy đặt câu hỏi về các tài liệu đã tải lên</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] p-3 rounded-lg ${
                          message.type === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {(typeof message.timestamp === 'string' ? new Date(message.timestamp) : message.timestamp).toLocaleTimeString('vi-VN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isSendingMessage && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-100">
                <div className="bg-white rounded-2xl border border-gray-200 p-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder={canChat ? "Hỏi về các tài liệu đã tải lên..." : "Tải một nguồn lên để bắt đầu"}
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 text-gray-900 bg-transparent outline-none"
                      disabled={!canChat || isSendingMessage}
                    />
                    <span className="text-xs text-gray-400">{readySources.length} nguồn</span>
                    <button 
                      onClick={handleSendMessage}
                      disabled={!canChat || !chatMessage.trim() || isSendingMessage}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        canChat && chatMessage.trim() && !isSendingMessage
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-gray-300'
                      }`}
                    >
                      {isSendingMessage ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <Send className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Studio Panel */}
          {activeTab === 'studio' && (
            <div className="flex-1 bg-white mx-4 my-4 rounded-2xl overflow-hidden">
              <div className="p-4 space-y-6 overflow-y-auto h-full">
                {/* Audio Overview Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-medium text-gray-900">Tổng quan bằng âm thanh</h3>
                  </div>
                  
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Mic className="w-5 h-5 text-gray-700" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 mb-3">
                          Cuộc trò chuyện tìm hiểu chuyên sâu<br />
                          Hai người dẫn dắt
                        </p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => toast('Tính năng tùy chỉnh sẽ sớm có!')}
                            disabled={!canUseStudio}
                            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                              canUseStudio 
                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                                : 'bg-gray-200 text-gray-400'
                            }`}
                          >
                            Tuỳ chỉnh
                          </button>
                          <button 
                            onClick={handleGenerateAudio}
                            disabled={!canUseStudio || isGeneratingAudio}
                            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                              canUseStudio && !isGeneratingAudio
                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                : 'bg-gray-300 text-gray-500'
                            }`}
                          >
                            {isGeneratingAudio ? 'Đang tạo...' : 'Tạo'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-medium text-gray-900">Ghi chú</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-6">
                    <button 
                      onClick={handleCreateNote}
                      disabled={!canUseStudio}
                      className={`btn-round btn-ghost justify-center transition-all ${
                        canUseStudio ? 'hover:bg-gray-100' : 'opacity-60'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      Thêm ghi chú
                    </button>
                    <button 
                      onClick={() => router.push('/dashboard/qa')}
                      disabled={!canUseStudio}
                      className={`btn-round btn-ghost justify-center transition-all ${
                        canUseStudio ? 'hover:bg-gray-100' : 'opacity-60'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      Hướng dẫn học tập
                    </button>
                  </div>

                  <div className="text-center">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 opacity-60">
                      <Edit3 className="w-7 h-7 text-gray-400" />
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed opacity-60">
                      Những ghi chú đã lưu sẽ xuất hiện ở đây<br />
                      Lưu tin nhắn trò chuyện để tạo một ghi chú mới hoặc nhấp vào nút Thêm ghi chú ở trên.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="hidden lg:block fixed bottom-0 left-1/2 transform -translate-x-1/2 p-4">
        <p className="text-xs text-gray-500 text-center opacity-60">
          SmartDoc có thể đưa ra thông tin không chính xác; hãy kiểm tra kỹ câu trả lời mà bạn nhận được.
        </p>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-[870px] max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
              <h2 className="text-xl font-normal text-gray-900">Thêm nguồn</h2>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleExplore}
                  className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-blue-100 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Khám phá các nguồn
                </button>
                <button 
                  onClick={() => setShowUpload(false)}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
                  disabled={isUploading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(90vh-80px)]">
              <p className="text-gray-700 leading-relaxed mb-8">
                Các nguồn giúp SmartDoc đưa ra câu trả lời dựa trên những thông tin quan trọng nhất đối với bạn.<br />
                (Ví dụ: kế hoạch tiếp thị, nội dung khoá học, ghi chú nghiên cứu, bản chép lời cuộc họp, tài liệu bán hàng, v.v.)
              </p>

              <div
                {...getRootProps()}
                className={`bg-gray-50 rounded-2xl p-12 text-center mb-8 cursor-pointer transition-colors ${
                  isDragActive ? 'bg-blue-50 border-2 border-blue-300' : 
                  isUploading ? 'bg-gray-100 cursor-not-allowed' :
                  'hover:bg-gray-100'
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {isUploading ? (
                    <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                  ) : (
                    <Upload className="w-7 h-7 text-blue-600" />
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  {isDragActive ? 'Thả file ở đây...' : 
                   isUploading ? 'Đang tải lên...' :
                   'Tải nguồn lên'}
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  {isDragActive ? 'Thả file để tải lên' : 
                   isUploading ? 'Vui lòng đợi...' :
                   'Kéo và thả hoặc chọn tệp để tải lên'}
                </p>
                <p className="text-sm text-gray-500">
                  Các loại tệp được hỗ trợ: PDF, DOC, DOCX, TXT, Markdown, Âm thanh (mp3), Hình ảnh
                </p>
              </div>

              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-gray-700">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-900">Giới hạn nguồn</span>
                </div>
                
                <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(100, (sources.length / 50) * 100)}%` }}
                  ></div>
                </div>
                
                <span className="text-sm text-gray-900 font-medium">{sources.length}/50</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}