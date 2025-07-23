// src/app/dashboard/qa/page.tsx
'use client'
import { useState, useRef, useEffect } from 'react'
import { 
  Send, 
  MessageSquare, 
  FileText, 
  Clock, 
  ThumbsUp, 
  ThumbsDown, 
  Copy,
  Bookmark,
  MoreHorizontal,
  Settings,
  Download,
  RefreshCw,
  Trash2,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: Array<{
    title: string
    page?: number
    excerpt: string
    relevance: number
  }>
  rating?: 'up' | 'down' | null
  saved?: boolean
}

interface Conversation {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messageCount: number
}

interface SuggestedQuestion {
  id: string
  question: string
  category: string
}

export default function QAPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [suggestedQuestions] = useState<SuggestedQuestion[]>([
    { id: '1', question: 'Chế độ bảo hiểm xã hội của công ty như thế nào?', category: 'Nhân sự' },
    { id: '2', question: 'Quy trình xin nghỉ phép là gì?', category: 'Nhân sự' },
    { id: '3', question: 'Chính sách thưởng cuối năm ra sao?', category: 'Tài chính' },
    { id: '4', question: 'Quy định về giờ làm việc của công ty?', category: 'Nhân sự' },
    { id: '5', question: 'Cách thức báo cáo chi phí đi công tác?', category: 'Tài chính' },
    { id: '6', question: 'Quy trình onboarding cho nhân viên mới?', category: 'Nhân sự' }
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Mock AI responses
  const generateResponse = (question: string): string => {
    const responses: Record<string, string> = {
      'bảo hiểm': `Về chế độ bảo hiểm xã hội, công ty thực hiện đóng đầy đủ các loại bảo hiểm theo quy định pháp luật:

**Bảo hiểm bắt buộc:**
• Bảo hiểm xã hội: 22% (công ty đóng 17.5%, nhân viên đóng 10.5%)
• Bảo hiểm y tế: 4.5% (công ty đóng 3%, nhân viên đóng 1.5%) 
• Bảo hiểm thất nghiệp: 2% (công ty đóng 1%, nhân viên đóng 1%)

**Bảo hiểm bổ sung:**
• Bảo hiểm sức khỏe toàn diện cho tất cả nhân viên
• Bảo hiểm tai nạn 24/7
• Gói khám sức khỏe định kỳ hàng năm

Công ty cam kết đóng bảo hiểm đúng hạn và theo mức lương thực tế của nhân viên.`,

      'nghỉ phép': `Quy định nghỉ phép của công ty như sau:

**Nghỉ phép năm:**
• Nhân viên được hưởng 12 ngày nghỉ phép năm
• Cộng thêm 1 ngày cho mỗi năm làm việc (tối đa 18 ngày)
• Thâm niên từ 5 năm trở lên: 15 ngày/năm
• Thâm niên từ 10 năm trở lên: 18 ngày/năm

**Quy trình xin nghỉ phép:**
1. Đăng ký trên hệ thống nội bộ trước ít nhất 3 ngày làm việc
2. Được sự phê duyệt của trưởng phòng trực tiếp
3. Bàn giao công việc cho đồng nghiệp (nếu cần)
4. Xác nhận lại với HR trước khi nghỉ

**Nghỉ phép đặc biệt:**
• Nghỉ ốm: Theo quy định pháp luật
• Nghỉ thai sản: 6 tháng cho nữ, 5 ngày cho nam
• Nghỉ hiếu, hỷ: Theo quy định trong nội quy`,

      'thưởng': `Chính sách thưởng của công ty bao gồm:

**Thưởng định kỳ:**
• Thưởng tháng 13: 1 tháng lương cơ bản
• Thưởng Tết Nguyên Đán: 0.5 - 2 tháng lương (tùy theo hiệu quả công việc)
• Thưởng hiệu suất quý: 5-15% lương cơ bản

**Thưởng đột xuất:**
• Thưởng hoàn thành dự án: 2-10 triệu VNĐ
• Thưởng sáng kiến cải tiến: 1-5 triệu VNĐ  
• Thưởng nhân viên xuất sắc tháng: 2 triệu VNĐ

**Thưởng thâm niên:**
• 3 năm: 1 tháng lương
• 5 năm: 1.5 tháng lương
• 10 năm: 2 tháng lương

Tất cả các khoản thưởng đều được tính thuế theo quy định pháp luật.`,

      'default': `Dựa trên các tài liệu đã phân tích, tôi có thể trả lời câu hỏi của bạn như sau:

Thông tin này được tổng hợp từ các tài liệu có liên quan trong hệ thống. Tôi đã tìm kiếm trong cơ sở dữ liệu tài liệu và tìm thấy những thông tin phù hợp với câu hỏi của bạn.

Nếu bạn cần thông tin chi tiết hơn, vui lòng tham khảo các nguồn dẫn bên dưới hoặc đặt câu hỏi cụ thể hơn.`
    }

    const lowerQuestion = question.toLowerCase()
    for (const [key, response] of Object.entries(responses)) {
      if (key !== 'default' && lowerQuestion.includes(key)) {
        return response
      }
    }
    return responses.default
  }

  const generateSources = (question: string) => {
    const allSources = [
      {
        title: 'Quy chế lao động nội bộ 2024',
        page: 15,
        excerpt: 'Nhân viên có quyền được nghỉ phép theo quy định pháp luật và quy định của công ty...',
        relevance: 95
      },
      {
        title: 'Hướng dẫn các chế độ phúc lợi',
        excerpt: 'Công ty cam kết đảm bảo quyền lợi cho người lao động theo đúng quy định...',
        relevance: 88
      },
      {
        title: 'Chính sách thưởng và phúc lợi 2024',
        page: 8,
        excerpt: 'Hệ thống thưởng được thiết kế để động viên và ghi nhận những đóng góp...',
        relevance: 82
      },
      {
        title: 'Quy trình quản lý nhân sự',
        page: 22,
        excerpt: 'Các thủ tục hành chính liên quan đến nhân sự được thực hiện theo quy trình chuẩn...',
        relevance: 75
      }
    ]

    // Return 2-3 most relevant sources
    return allSources.slice(0, 2 + Math.floor(Math.random() * 2))
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    // Create or update conversation
    if (!activeConversation) {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: inputValue.length > 50 ? inputValue.slice(0, 50) + '...' : inputValue,
        lastMessage: inputValue,
        timestamp: new Date(),
        messageCount: 1
      }
      setConversations(prev => [newConversation, ...prev])
      setActiveConversation(newConversation.id)
    } else {
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation
          ? { ...conv, lastMessage: inputValue, timestamp: new Date(), messageCount: conv.messageCount + 1 }
          : conv
      ))
    }

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateResponse(inputValue),
        timestamp: new Date(),
        sources: generateSources(inputValue),
        rating: null
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500 + Math.random() * 2000)
  }

  const handleRating = (messageId: string, rating: 'up' | 'down') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, rating } : msg
    ))
    toast.success(rating === 'up' ? 'Cảm ơn phản hồi tích cực!' : 'Cảm ơn phản hồi, chúng tôi sẽ cải thiện!')
  }

  const handleSaveMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, saved: !msg.saved } : msg
    ))
    const message = messages.find(m => m.id === messageId)
    toast.success(message?.saved ? 'Đã bỏ lưu tin nhắn' : 'Đã lưu tin nhắn!')
  }

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast.success('Đã sao chép nội dung!')
    }).catch(() => {
      toast.error('Không thể sao chép')
    })
  }

  const handleNewConversation = () => {
    setMessages([])
    setActiveConversation(null)
  }

  const handleLoadConversation = (conversationId: string) => {
    // In a real app, load messages from this conversation
    setActiveConversation(conversationId)
    // Mock loading conversation messages
    toast('Đã tải cuộc hội thoại')
  }

  const handleDeleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId))
    if (activeConversation === conversationId) {
      handleNewConversation()
    }
    toast.success('Đã xóa cuộc hội thoại!')
  }

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question)
    setTimeout(() => handleSendMessage(), 100)
  }

  const handleDownloadConversation = () => {
    if (messages.length === 0) {
      toast.error('Không có cuộc hội thoại nào để tải xuống')
      return
    }

    const conversationText = messages.map(msg => 
      `[${msg.timestamp.toLocaleString('vi-VN')}] ${msg.type === 'user' ? 'Bạn' : 'SmartDoc'}: ${msg.content}`
    ).join('\n\n')

    const element = document.createElement('a')
    const file = new Blob([conversationText], { type: 'text/plain;charset=utf-8' })
    element.href = URL.createObjectURL(file)
    element.download = `cuoc_hoi_thoai_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success('Đã tải xuống cuộc hội thoại!')
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-lg overflow-hidden">
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-80 border-r border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium text-gray-900">Cuộc hội thoại</h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="lg:hidden text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <button
              onClick={handleNewConversation}
              className="w-full btn btn-primary btn-sm"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Cuộc hội thoại mới
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length > 0 ? (
              <div className="p-2 space-y-1">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group p-3 rounded-lg cursor-pointer transition-colors ${
                      activeConversation === conv.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleLoadConversation(conv.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-gray-900 truncate">
                          {conv.title}
                        </h3>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {conv.lastMessage}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {conv.messageCount} tin nhắn
                          </span>
                          <span className="text-xs text-gray-400">
                            {conv.timestamp.toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteConversation(conv.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Chưa có cuộc hội thoại nào</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {!showSidebar && (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="mr-3 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <MessageSquare className="h-5 w-5" />
                </button>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">Hỏi đáp thông tin</h1>
                <p className="text-sm text-gray-600">Đặt câu hỏi và nhận câu trả lời từ hệ thống tài liệu</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownloadConversation}
                disabled={messages.length === 0}
                className="btn btn-secondary btn-sm disabled:opacity-50"
                title="Tải xuống cuộc hội thoại"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={() => toast('Tính năng cài đặt sẽ sớm có!')}
                className="btn btn-secondary btn-sm"
                title="Cài đặt"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có cuộc trò chuyện nào</h3>
              <p className="text-gray-500 mb-8">Hãy bắt đầu bằng cách đặt một câu hỏi về tài liệu của bạn</p>
              
              {/* Suggested Questions */}
              <div className="max-w-2xl mx-auto">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Gợi ý câu hỏi:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestedQuestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestedQuestion(suggestion.question)}
                      className="text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-blue-600">{suggestion.category}</span>
                        <MessageSquare className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                      </div>
                      <p className="text-sm text-gray-700">"{suggestion.question}"</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-3xl ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-gray-200'
                  } rounded-lg p-4 shadow-sm`}>
                    <div className="flex items-start space-x-3">
                      {message.type === 'assistant' && (
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                        
                        {/* Sources */}
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="text-sm font-medium text-gray-700 mb-2">Nguồn tham khảo:</div>
                            <div className="space-y-2">
                              {message.sources.map((source, index) => (
                                <div key={index} className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
                                  <FileText className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                  <div className="text-xs flex-1">
                                    <div className="font-medium text-gray-800 flex items-center justify-between">
                                      <span>
                                        {source.title}
                                        {source.page && <span className="text-gray-500 ml-1">(trang {source.page})</span>}
                                      </span>
                                      <span className="text-green-600 font-medium">{source.relevance}%</span>
                                    </div>
                                    <div className="text-gray-600 mt-1">"{source.excerpt}"</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Message Actions */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {message.timestamp.toLocaleTimeString('vi-VN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                          <div className="flex items-center space-x-2">
                            {message.type === 'assistant' && (
                              <>
                                <button
                                  onClick={() => handleCopyMessage(message.content)}
                                  className="p-1 rounded text-gray-400 hover:text-blue-600"
                                  title="Sao chép"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleSaveMessage(message.id)}
                                  className={`p-1 rounded ${
                                    message.saved ? 'text-yellow-600' : 'text-gray-400 hover:text-yellow-600'
                                  }`}
                                  title={message.saved ? 'Bỏ lưu' : 'Lưu'}
                                >
                                  <Bookmark className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleRating(message.id, 'up')}
                                  className={`p-1 rounded ${
                                    message.rating === 'up' 
                                      ? 'text-green-600 bg-green-50' 
                                      : 'text-gray-400 hover:text-green-600'
                                  }`}
                                  title="Hữu ích"
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleRating(message.id, 'down')}
                                  className={`p-1 rounded ${
                                    message.rating === 'down' 
                                      ? 'text-red-600 bg-red-50' 
                                      : 'text-gray-400 hover:text-red-600'
                                  }`}
                                  title="Không hữu ích"
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Đặt câu hỏi về tài liệu của bạn..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="btn btn-primary disabled:opacity-50 px-6"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>Nhấn Enter để gửi</span>
            <span>{inputValue.length}/1000</span>
          </div>
        </div>
      </div>
    </div>
  )
}