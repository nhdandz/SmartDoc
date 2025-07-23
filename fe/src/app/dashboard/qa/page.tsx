// src/app/dashboard/qa/page.tsx
'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, MessageSquare, FileText, Clock, ThumbsUp, ThumbsDown } from 'lucide-react'

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: Array<{
    title: string
    page?: number
    excerpt: string
  }>
  rating?: 'up' | 'down' | null
}

export default function QAPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

    // Mock AI response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Dựa trên các tài liệu đã phân tích, tôi có thể trả lời câu hỏi của bạn như sau:

${generateMockResponse(inputValue)}

Thông tin này được tổng hợp từ các tài liệu có liên quan trong hệ thống. Bạn có thể tham khảo các nguồn dẫn bên dưới để kiểm chứng thông tin.`,
        timestamp: new Date(),
        sources: [
          {
            title: 'Quy chế lao động nội bộ 2024',
            page: 15,
            excerpt: 'Nhân viên có quyền được nghỉ phép theo quy định...'
          },
          {
            title: 'Hướng dẫn các chế độ phúc lợi',
            excerpt: 'Công ty cam kết đảm bảo quyền lợi cho người lao động...'
          }
        ],
        rating: null
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 2000)
  }

  const generateMockResponse = (question: string) => {
    if (question.toLowerCase().includes('bảo hiểm')) {
      return 'Về chế độ bảo hiểm, công ty đóng đầy đủ các loại bảo hiểm theo quy định pháp luật bao gồm bảo hiểm xã hội (22%), bảo hiểm y tế (4.5%) và bảo hiểm thất nghiệp (2%). Ngoài ra, công ty còn mua thêm bảo hiểm sức khỏe cho toàn bộ nhân viên.'
    }
    if (question.toLowerCase().includes('nghỉ phép')) {
      return 'Quy định nghỉ phép như sau: Nhân viên được nghỉ phép năm 12 ngày/năm, cộng thêm 1 ngày cho mỗi năm làm việc (tối đa 18 ngày). Nghỉ phép cần đăng ký trước ít nhất 3 ngày làm việc trên hệ thống nội bộ.'
    }
    return 'Đây là câu trả lời mẫu được tạo từ hệ thống AI dựa trên nội dung các tài liệu đã lưu trữ. Thông tin cụ thể sẽ được trích xuất từ các văn bản có liên quan.'
  }

  const handleRating = (messageId: string, rating: 'up' | 'down') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, rating } : msg
    ))
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200 bg-white">
        <h1 className="text-2xl font-bold text-gray-900">Hỏi đáp thông tin</h1>
        <p className="text-gray-600">Đặt câu hỏi và nhận câu trả lời từ hệ thống tài liệu</p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có cuộc trò chuyện nào</h3>
            <p className="text-gray-500 mb-6">Hãy bắt đầu bằng cách đặt một câu hỏi về tài liệu của bạn</p>
            <div className="max-w-md mx-auto">
              <div className="text-sm text-gray-600 mb-2">Gợi ý câu hỏi:</div>
              <div className="space-y-2">
                <button 
                  onClick={() => setInputValue('Chế độ bảo hiểm xã hội của công ty như thế nào?')}
                  className="block w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm"
                >
                  "Chế độ bảo hiểm xã hội của công ty như thế nào?"
                </button>
                <button 
                  onClick={() => setInputValue('Quy trình xin nghỉ phép là gì?')}
                  className="block w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm"
                >
                  "Quy trình xin nghỉ phép là gì?"
                </button>
                <button 
                  onClick={() => setInputValue('Chính sách thưởng cuối năm ra sao?')}
                  className="block w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm"
                >
                  "Chính sách thưởng cuối năm ra sao?"
                </button>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl ${message.type === 'user' ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200'} rounded-lg p-4 shadow-sm`}>
              <div className="flex items-start space-x-3">
                {message.type === 'assistant' && (
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  
                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-sm font-medium text-gray-700 mb-2">Nguồn tham khảo:</div>
                      <div className="space-y-2">
                        {message.sources.map((source, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <FileText className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <div className="font-medium text-gray-800">
                                {source.title}
                                {source.page && <span className="text-gray-500"> (trang {source.page})</span>}
                              </div>
                              <div className="text-gray-600 text-xs mt-1">"{source.excerpt}"</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rating and Timestamp */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {message.timestamp.toLocaleTimeString('vi-VN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    {message.type === 'assistant' && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRating(message.id, 'up')}
                          className={`p-1 rounded ${
                            message.rating === 'up' 
                              ? 'text-green-600 bg-green-50' 
                              : 'text-gray-400 hover:text-green-600'
                          }`}
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
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </button>
                      </div>
                    )}
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

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-white">
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Đặt câu hỏi về tài liệu của bạn..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="btn btn-primary disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
