// src/app/dashboard/search/page.tsx
'use client'
import { useState } from 'react'
import { Search, Filter, FileText, Calendar, User, Building, Tag } from 'lucide-react'

interface SearchResult {
  id: string
  title: string
  content: string
  author: string
  department: string
  date: Date
  type: string
  highlights: string[]
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeFilters, setActiveFilters] = useState({
    dateRange: 'all',
    fileType: 'all',
    department: 'all'
  })

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    
    // Mock search delay
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Quy định về chế độ bảo hiểm xã hội',
          content: 'Theo quy định của công ty, tất cả nhân viên chính thức được hưởng đầy đủ các chế độ bảo hiểm xã hội, bao gồm bảo hiểm y tế, bảo hiểm thất nghiệp và bảo hiểm tai nạn lao động...',
          author: 'Phòng Nhân sự',
          department: 'Nhân sự',
          date: new Date('2024-01-10'),
          type: 'PDF',
          highlights: ['bảo hiểm xã hội', 'nhân viên', 'chế độ']
        },
        {
          id: '2',
          title: 'Hướng dẫn quy trình xin phép nghỉ việc',
          content: 'Nhân viên muốn xin nghỉ việc cần tuân thủ các quy trình sau: 1. Gửi đơn xin nghỉ việc trước ít nhất 30 ngày. 2. Hoàn tất các công việc được giao...',
          author: 'Nguyễn Văn A',
          department: 'Nhân sự',
          date: new Date('2024-01-08'),
          type: 'DOCX',
          highlights: ['nghỉ việc', 'quy trình', '30 ngày']
        },
        {
          id: '3',
          title: 'Báo cáo tài chính quý IV/2023',
          content: 'Kết quả kinh doanh quý IV/2023 cho thấy doanh thu đạt 2.5 tỷ đồng, tăng 15% so với cùng kỳ năm trước. Chi phí hoạt động được kiểm soát tốt...',
          author: 'Phòng Tài chính',
          department: 'Tài chính',
          date: new Date('2024-01-05'),
          type: 'PDF',
          highlights: ['báo cáo tài chính', 'doanh thu', 'quý IV']
        }
      ]
      
      setSearchResults(mockResults)
      setIsSearching(false)
    }, 1500)
  }

  const highlightText = (text: string, highlights: string[]) => {
    let highlightedText = text
    highlights.forEach(highlight => {
      const regex = new RegExp(`(${highlight})`, 'gi')
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
    })
    return highlightedText
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tìm kiếm văn bản</h1>
        <p className="text-gray-600">Tìm kiếm thông tin trong toàn bộ hệ thống tài liệu</p>
      </div>

      {/* Search Box */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Nhập từ khóa tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <button 
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isSearching}
            className="btn btn-primary px-8 disabled:opacity-50"
          >
            {isSearching ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </div>

        {/* Advanced Filters */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <span className="font-medium text-gray-700">Bộ lọc nâng cao</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Thời gian
              </label>
              <select 
                value={activeFilters.dateRange}
                onChange={(e) => setActiveFilters({...activeFilters, dateRange: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Tất cả</option>
                <option value="week">7 ngày qua</option>
                <option value="month">30 ngày qua</option>
                <option value="quarter">3 tháng qua</option>
                <option value="year">1 năm qua</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Định dạng
              </label>
              <select 
                value={activeFilters.fileType}
                onChange={(e) => setActiveFilters({...activeFilters, fileType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Tất cả</option>
                <option value="pdf">PDF</option>
                <option value="docx">DOCX</option>
                <option value="image">Hình ảnh</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="inline h-4 w-4 mr-1" />
                Phòng ban
              </label>
              <select 
                value={activeFilters.department}
                onChange={(e) => setActiveFilters({...activeFilters, department: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Tất cả</option>
                <option value="hr">Nhân sự</option>
                <option value="finance">Tài chính</option>
                <option value="operations">Vận hành</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Kết quả tìm kiếm ({searchResults.length})
            </h2>
            <div className="text-sm text-gray-500">
              Tìm thấy trong 0.45 giây
            </div>
          </div>

          {searchResults.map((result) => (
            <div key={result.id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-medium text-primary-600 hover:text-primary-800 cursor-pointer">
                  {result.title}
                </h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {result.type}
                </span>
              </div>
              
              <div 
                className="text-gray-700 mb-4 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: highlightText(result.content, result.highlights)
                }}
              />

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {result.author}
                  </div>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    {result.department}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {result.date.toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-primary-600 hover:text-primary-800">
                    Xem chi tiết
                  </button>
                  <button className="text-gray-600 hover:text-gray-800">
                    Tải xuống
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
                <Tag className="h-4 w-4 text-gray-400 mr-2" />
                <div className="flex flex-wrap gap-2">
                  {result.highlights.map((tag, index) => (
                    <span 
                      key={index}
                      className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {searchQuery && searchResults.length === 0 && !isSearching && (
        <div className="card p-12 text-center">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy kết quả</h3>
          <p className="text-gray-500">
            Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc
          </p>
        </div>
      )}
    </div>
  )
}