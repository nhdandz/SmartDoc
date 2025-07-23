// src/components/dashboard/RecentQuestions.tsx
'use client'
import { useState, useEffect } from 'react'
import { MessageSquare, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface Question {
  id: string
  question: string
  answer: string
  timestamp: Date
}

export default function RecentQuestions() {
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    // Mock data
    setQuestions([
      {
        id: '1',
        question: 'Quy trình xin phép nghỉ việc là gì?',
        answer: 'Theo quy định trong hợp đồng lao động, nhân viên cần gửi đơn xin nghỉ việc trước ít nhất 30 ngày...',
        timestamp: new Date('2024-01-15T10:30:00')
      },
      {
        id: '2',
        question: 'Chế độ bảo hiểm xã hội như thế nào?',
        answer: 'Công ty đóng bảo hiểm xã hội theo quy định của pháp luật, bao gồm bảo hiểm y tế, thất nghiệp...',
        timestamp: new Date('2024-01-14T15:20:00')
      },
      {
        id: '3',
        question: 'Thời gian làm việc chuẩn là bao nhiêu giờ?',
        answer: 'Theo quy chế lao động, thời gian làm việc chuẩn là 8 tiếng/ngày, 5 ngày/tuần...',
        timestamp: new Date('2024-01-13T09:15:00')
      },
    ])
  }, [])

  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Câu hỏi gần đây</h3>
      <div className="space-y-4">
        {questions.map((item) => (
          <div key={item.id} className="p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex items-start">
              <MessageSquare className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">{item.question}</p>
                <p className="text-xs text-gray-600 line-clamp-2 mb-2">{item.answer}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(item.timestamp, 'dd/MM/yyyy HH:mm', { locale: vi })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          Xem tất cả câu hỏi →
        </button>
      </div>
    </div>
  )
}