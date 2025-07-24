// src/app/dashboard/search/page.tsx
'use client'
import { useState } from 'react'
import { Search, Filter, FileText, Calendar, User, Building, Tag, Download, Eye, X, Bookmark, Share2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface SearchResult {
  id: string
  title: string
  content: string
  author: string
  department: string
  date: Date
  type: string
  highlights: string[]
  size: string
  folder: string
  relevanceScore: number
}

interface SavedSearch {
  id: string
  name: string
  query: string
  filters: any
  resultCount: number
  savedDate: Date
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState({
    dateRange: 'all',
    fileType: 'all',
    department: 'all',
    author: '',
    folder: 'all',
    size: 'all'
  })

  // Mock data for departments, authors, etc.
  const departments = ['Tất cả', 'Nhân sự', 'Tài chính', 'Vận hành', 'Marketing', 'IT']
  const fileTypes = ['Tất cả', 'PDF', 'DOCX', 'TXT', 'Image']
  const folders = ['Tất cả', 'Tài liệu chung', 'Báo cáo', 'Hợp đồng', 'Quy trình']

  const mockSearchResults: SearchResult[] = [
    {
      id: '1',
      title: 'Quy định về chế độ bảo hiểm xã hội',
      content: 'Theo quy định của công ty, tất cả nhân viên chính thức được hưởng đầy đủ các chế độ bảo hiểm xã hội, bao gồm bảo hiểm y tế, bảo hiểm thất nghiệp và bảo hiểm tai nạn lao động. Công ty đóng 100% phí bảo hiểm cho người lao động...',
      author: 'Phòng Nhân sự',
      department: 'Nhân sự',
      date: new Date('2024-01-10'),
      type: 'PDF',
      highlights: ['bảo hiểm xã hội', 'nhân viên', 'chế độ'],
      size: '2.1 MB',
      folder: 'Quy trình',
      relevanceScore: 95
    },
    {
      id: '2',
      title: 'Hướng dẫn quy trình xin phép nghỉ việc',
      content: 'Nhân viên muốn xin nghỉ việc cần tuân thủ các quy trình sau: 1. Gửi đơn xin nghỉ việc trước ít nhất 30 ngày. 2. Hoàn tất các công việc được giao. 3. Bàn giao tài sản công ty. 4. Thực hiện thủ tục thanh toán và nhận lương...',
      author: 'Nguyễn Văn A',
      department: 'Nhân sự',
      date: new Date('2024-01-08'),
      type: 'DOCX',
      highlights: ['nghỉ việc', 'quy trình', '30 ngày'],
      size: '156 KB',
      folder: 'Hướng dẫn',
      relevanceScore: 88
    },
    {
      id: '3',
      title: 'Báo cáo tài chính quý IV/2023',
      content: 'Kết quả kinh doanh quý IV/2023 cho thấy doanh thu đạt 2.5 tỷ đồng, tăng 15% so với cùng kỳ năm trước. Chi phí hoạt động được kiểm soát tốt, lợi nhuận trước thuế đạt 700 triệu đồng. Tỷ suất lợi nhuận đạt 28%...',
      author: 'Phòng Tài chính',
      department: 'Tài chính',
      date: new Date('2024-01-05'),
      type: 'PDF',
      highlights: ['báo cáo tài chính', 'doanh thu', 'quý IV'],
      size: '3.2 MB',
      folder: 'Báo cáo',
      relevanceScore: 82
    },
    {
      id: '4',
      title: 'Quy trình vận hành hệ thống IT',
      content: 'Tài liệu mô tả quy trình vận hành và bảo trì hệ thống công nghệ thông tin. Bao gồm các bước kiểm tra hàng ngày, sao lưu dữ liệu, và xử lý sự cố. Thời gian sao lưu: 02:00 AM hàng ngày...',
      author: 'Phòng IT',
      department: 'IT', 
      date: new Date('2024-01-03'),
      type: 'PDF',
      highlights: ['quy trình', 'vận hành', 'hệ thống'],
      size: '1.8 MB',
      folder: 'Quy trình',
      relevanceScore: 75
    }
  ]

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Vui lòng nhập từ khóa tìm kiếm')
      return
    }
    
    setIsSearching(true)
    
    // Add to search history
    if (!searchHistory.includes(searchQuery)) {
      setSearchHistory(prev => [searchQuery, ...prev.slice(0, 9)]) // Keep last 10 searches
    }
    
    // Mock search delay
    setTimeout(() => {
      // Filter results based on query and filters
      let filteredResults = mockSearchResults.filter(result => {
        const matchesQuery = result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            result.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            result.author.toLowerCase().includes(searchQuery.toLowerCase())
        
        const matchesFilters = 
          (activeFilters.department === 'all' || result.department === activeFilters.department) &&
          (activeFilters.fileType === 'all' || result.type === activeFilters.fileType) &&
          (activeFilters.folder === 'all' || result.folder === activeFilters.folder) &&
          (activeFilters.author === '' || result.author.toLowerCase().includes(activeFilters.author.toLowerCase()))
        
        return matchesQuery && matchesFilters
      })

      // Sort by relevance
      filteredResults.sort((a, b) => b.relevanceScore - a.relevanceScore)
      
      setSearchResults(filteredResults)
      setIsSearching(false)
      
      if (filteredResults.length === 0) {
        toast('Không tìm thấy kết quả phù hợp')
      } else {
        toast.success(`Tìm thấy ${filteredResults.length} kết quả`)
      }
    }, 1000)
  }

  const highlightText = (text: string, highlights: string[]) => {
    let highlightedText = text
    highlights.forEach(highlight => {
      const regex = new RegExp(`(${highlight})`, 'gi')
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
    })
    return highlightedText
  }

  const handleSaveSearch = () => {
    if (!searchQuery.trim()) {
      toast.error('Không có tìm kiếm nào để lưu')
      return
    }

    const savedSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchQuery,
      query: searchQuery,
      filters: activeFilters,
      resultCount: searchResults.length,
      savedDate: new Date()
    }

    setSavedSearches(prev => [savedSearch, ...prev])
    toast.success('Đã lưu tìm kiếm!')
  }

  const handleLoadSavedSearch = (saved: SavedSearch) => {
    setSearchQuery(saved.query)
    setActiveFilters(saved.filters)
    // Auto trigger search
    setTimeout(() => handleSearch(), 100)
  }

  const handleDeleteSavedSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(s => s.id !== id))
    toast.success('Đã xóa tìm kiếm đã lưu!')
  }

  const handleViewDocument = (result: SearchResult) => {
    toast(`Đang mở ${result.title}...`)
  }

  const handleDownloadDocument = (result: SearchResult) => {
    toast.success(`Đang tải xuống ${result.title}...`)
  }

  const handleShareResult = (result: SearchResult) => {
    navigator.clipboard.writeText(`${result.title} - ${window.location.origin}/documents/${result.id}`)
    toast.success('Đã sao chép liên kết!')
  }

  const clearFilters = () => {
    setActiveFilters({
      dateRange: 'all',
      fileType: 'all', 
      department: 'all',
      author: '',
      folder: 'all',
      size: 'all'
    })
    toast('Đã xóa tất cả bộ lọc')
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
                className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="btn btn-secondary"
            >
              <Filter className="h-4 w-4 mr-2" />
              Bộ lọc
            </button>
            <button 
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
              className="btn btn-primary px-8 disabled:opacity-50"
            >
              {isSearching ? 'Đang tìm...' : 'Tìm kiếm'}
            </button>
          </div>
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">Tìm kiếm gần đây:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((query, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(query)
                    setTimeout(() => handleSearch(), 100)
                  }}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-gray-400 mr-2" />
                <span className="font-medium text-gray-700">Bộ lọc nâng cao</span>
              </div>
              <button 
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Xóa tất cả
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Thời gian
                </label>
                <select 
                  value={activeFilters.dateRange}
                  onChange={(e) => setActiveFilters({...activeFilters, dateRange: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả</option>
                  <option value="today">Hôm nay</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {fileTypes.map(type => (
                    <option key={type} value={type === 'Tất cả' ? 'all' : type}>{type}</option>
                  ))}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept === 'Tất cả' ? 'all' : dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Tác giả
                </label>
                <input
                  type="text"
                  value={activeFilters.author}
                  onChange={(e) => setActiveFilters({...activeFilters, author: e.target.value})}
                  placeholder="Tên tác giả..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thư mục
                </label>
                <select 
                  value={activeFilters.folder}
                  onChange={(e) => setActiveFilters({...activeFilters, folder: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {folders.map(folder => (
                    <option key={folder} value={folder === 'Tất cả' ? 'all' : folder}>{folder}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tìm kiếm đã lưu</h3>
          <div className="space-y-2">
            {savedSearches.map((saved) => (
              <div key={saved.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <button
                    onClick={() => handleLoadSavedSearch(saved)}
                    className="text-left hover:text-blue-600"
                  >
                    <div className="font-medium">{saved.name}</div>
                    <div className="text-xs text-gray-500">
                      {saved.resultCount} kết quả • {saved.savedDate.toLocaleDateString('vi-VN')}
                    </div>
                  </button>
                </div>
                <button
                  onClick={() => handleDeleteSavedSearch(saved.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Kết quả tìm kiếm ({searchResults.length})
            </h2>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">
                Tìm thấy trong 0.{Math.floor(Math.random() * 9) + 1}{Math.floor(Math.random() * 9)}s
              </div>
              <button 
                onClick={handleSaveSearch}
                className="btn btn-secondary btn-sm"
              >
                <Bookmark className="h-4 w-4 mr-1" />
                Lưu tìm kiếm
              </button>
            </div>
          </div>

          {searchResults.map((result) => (
            <div key={result.id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={() => handleViewDocument(result)}
                      className="text-lg font-medium text-blue-600 hover:text-blue-800 text-left"
                    >
                      {result.title}
                    </button>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {result.type}
                    </span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {result.relevanceScore}% phù hợp
                    </span>
                  </div>
                  
                  <div 
                    className="text-gray-700 mb-4 leading-relaxed text-sm"
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
                      <div>{result.size}</div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
                    <Tag className="h-4 w-4 text-gray-400 mr-2" />
                    <div className="flex flex-wrap gap-2">
                      {result.highlights.map((tag, index) => (
                        <span 
                          key={index}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button 
                    onClick={() => handleViewDocument(result)}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                    title="Xem chi tiết"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDownloadDocument(result)}
                    className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50"
                    title="Tải xuống"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleShareResult(result)}
                    className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50"
                    title="Chia sẻ"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {searchQuery && searchResults.length === 0 && !isSearching && (
        <div className="card p-12 text-center">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy kết quả</h3>
          <p className="text-gray-500 mb-4">
            Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Gợi ý:</p>
            <ul className="text-left inline-block">
              <li>• Kiểm tra chính tả từ khóa</li>
              <li>• Sử dụng từ khóa ngắn gọn hơn</li>
              <li>• Thử các từ đồng nghĩa</li>
              <li>• Xóa bớt bộ lọc</li>
            </ul>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!searchQuery && searchResults.length === 0 && (
        <div className="card p-12 text-center">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tìm kiếm tài liệu</h3>
          <p className="text-gray-500 mb-6">
            Nhập từ khóa để tìm kiếm trong toàn bộ hệ thống tài liệu
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <p className="font-medium">Ví dụ tìm kiếm:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['bảo hiểm', 'quy trình', 'báo cáo tài chính', 'hợp đồng'].map((example) => (
                <button
                  key={example}
                  onClick={() => {
                    setSearchQuery(example)
                    setTimeout(() => handleSearch(), 100)
                  }}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}