'use client'
import { useState } from 'react'
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
  Menu
} from 'lucide-react'

type TabType = 'sources' | 'chat' | 'studio'

export default function Dashboard() {
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [chatMessage, setChatMessage] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('sources')

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
            🎉 Mới! Chia sẻ công khai
          </div>
          <button className="btn-round btn-secondary text-xs lg:text-sm">
            <Share className="w-4 h-4" />
            <span className="hidden sm:inline">Chia sẻ</span>
          </button>
          <button className="btn-round btn-secondary text-xs lg:text-sm">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Cài đặt</span>
          </button>
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-300 rounded-full"></div>
        </div>
      </header>

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
            Nguồn
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
              <h2 className="font-medium text-gray-900">Nguồn</h2>
              <div className="ml-auto">
                <button className="icon-btn">
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
                >
                  <Plus className="w-4 h-4" />
                  Thêm
                </button>
                <button className="btn-round btn-ghost flex-1">
                  <Search className="w-4 h-4" />
                  Khám phá
                </button>
              </div>

              {/* Empty State */}
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4 opacity-60">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 text-sm leading-relaxed max-w-sm opacity-60">
                  Các nguồn đã lưu sẽ xuất hiện ở đây<br />
                  Nhấp vào "Thêm nguồn" ở trên để thêm tệp PDF, trang web, văn bản, video hoặc tệp âm thanh. Hoặc nhập một tệp ngay trên Google Drive.
                </p>
              </div>
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
              <div className="flex-1 p-4 flex flex-col items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-normal text-gray-900 mb-6">
                    Thêm một nguồn để bắt đầu
                  </h3>
                  <button 
                    className="btn-round btn-secondary"
                    onClick={() => setShowUpload(true)}
                  >
                    Tải nguồn lên
                  </button>
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-100">
                <div className="bg-white rounded-2xl border border-gray-200 p-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Tải một nguồn lên để bắt đầu"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      className="flex-1 text-gray-500 bg-transparent outline-none"
                      disabled
                    />
                    <span className="text-xs text-gray-400">0 nguồn</span>
                    <button className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center opacity-50">
                      <MessageSquare className="w-5 h-5 text-white" />
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
                        <button className="px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-xs font-medium opacity-60">
                          Tuỳ chỉnh
                        </button>
                        <button className="px-4 py-2 bg-gray-300 text-gray-600 rounded-full text-xs font-medium opacity-60">
                          Tạo
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
                  <button className="btn-round btn-ghost justify-center opacity-60">
                    <Plus className="w-4 h-4" />
                    Thêm ghi chú
                  </button>
                  <button className="btn-round btn-ghost justify-center opacity-60">
                    <BookOpen className="w-4 h-4" />
                    Hướng dẫn học tập
                  </button>
                  <button className="btn-round btn-ghost justify-center opacity-60">
                    <FileText className="w-4 h-4" />
                    Tài liệu tóm tắt
                  </button>
                  <button className="btn-round btn-ghost justify-center opacity-60">
                    <HelpCircle className="w-4 h-4" />
                    Câu hỏi thường gặp
                  </button>
                  <button className="btn-round btn-ghost justify-center opacity-60 col-span-2">
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

        {/* Mobile: Single Panel */}
        <div className="lg:hidden flex-1 flex flex-col">
          {/* Sources Panel */}
          {activeTab === 'sources' && (
            <div className="flex-1 bg-white mx-4 my-4 rounded-2xl overflow-hidden">
              {/* Sources Content */}
              <div className="p-4 h-full flex flex-col">
                {/* Action Buttons */}
                <div className="flex gap-2 mb-6">
                  <button 
                    className="btn-round btn-ghost flex-1"
                    onClick={() => setShowUpload(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Thêm
                  </button>
                  <button className="btn-round btn-ghost flex-1">
                    <Search className="w-4 h-4" />
                    Khám phá
                  </button>
                </div>

                {/* Empty State */}
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4 opacity-60">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed opacity-60">
                    Các nguồn đã lưu sẽ xuất hiện ở đây<br />
                    Nhấp vào "Thêm nguồn" ở trên để thêm tệp PDF, trang web, văn bản, video hoặc tệp âm thanh. Hoặc nhập một tệp ngay trên Google Drive.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Chat Panel */}
          {activeTab === 'chat' && (
            <div className="flex-1 bg-white mx-4 my-4 rounded-2xl overflow-hidden flex flex-col">
              {/* Chat Messages Area */}
              <div className="flex-1 p-4 flex flex-col items-center justify-center">
                <div className="text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-normal text-gray-900 mb-6">
                    Thêm một nguồn để bắt đầu
                  </h3>
                  <button 
                    className="btn-round btn-secondary"
                    onClick={() => setShowUpload(true)}
                  >
                    Tải nguồn lên
                  </button>
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-100">
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Tải một nguồn lên để bắt đầu"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      className="flex-1 text-gray-500 bg-transparent outline-none text-sm"
                      disabled
                    />
                    <span className="text-xs text-gray-400">0 nguồn</span>
                    <button className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center opacity-50">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Studio Panel */}
          {activeTab === 'studio' && (
            <div className="flex-1 bg-white mx-4 my-4 rounded-2xl overflow-hidden">
              <div className="p-4 space-y-6 h-full overflow-y-auto">
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
                          <button className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-full text-xs font-medium opacity-60">
                            Tuỳ chỉnh
                          </button>
                          <button className="px-3 py-1.5 bg-gray-300 text-gray-600 rounded-full text-xs font-medium opacity-60">
                            Tạo
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
                    <button className="btn-round btn-ghost justify-center opacity-60 text-xs">
                      <Plus className="w-4 h-4" />
                      Thêm ghi chú
                    </button>
                    <button className="btn-round btn-ghost justify-center opacity-60 text-xs">
                      <BookOpen className="w-4 h-4" />
                      Hướng dẫn học tập
                    </button>
                    <button className="btn-round btn-ghost justify-center opacity-60 text-xs">
                      <FileText className="w-4 h-4" />
                      Tài liệu tóm tắt
                    </button>
                    <button className="btn-round btn-ghost justify-center opacity-60 text-xs">
                      <HelpCircle className="w-4 h-4" />
                      Câu hỏi thường gặp
                    </button>
                    <button className="btn-round btn-ghost justify-center opacity-60 col-span-2 text-xs">
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
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
              <h2 className="text-xl font-normal text-gray-900">Thêm nguồn</h2>
              <div className="flex items-center gap-4">
                <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-blue-100 transition-colors">
                  <Search className="w-4 h-4" />
                  Khám phá các nguồn
                </button>
                <button 
                  onClick={() => setShowUpload(false)}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Description */}
              <p className="text-gray-700 leading-relaxed mb-8">
                Các nguồn giúp SmartDoc đưa ra câu trả lời dựa trên những thông tin quan trọng nhất đối với bạn.<br />
                (Ví dụ: kế hoạch tiếp thị, nội dung khoá học, ghi chú nghiên cứu, bản chép lời cuộc họp, tài liệu bán hàng, v.v.)
              </p>

              {/* Upload Area */}
              <div className="bg-gray-50 rounded-2xl p-12 text-center mb-8">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Tải nguồn lên</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Kéo và thả hoặc chọn tệp để tải lên
                </p>
                <p className="text-sm text-gray-500">
                  Các loại tệp được hỗ trợ: PDF, .txt, Markdown, Âm thanh (ví dụ: mp3)
                </p>
              </div>

              {/* Source Options Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Google Drive */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-700">
                        <path d="M6.26 5.27L9.5 11H2.95L6.26 5.27zM14.74 5.27L18.05 11H11.5L14.74 5.27zM12 13.73L8.69 19.46H15.31L12 13.73z"/>
                      </svg>
                    </div>
                    <h4 className="text-sm font-normal text-gray-900">Google Drive</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="bg-gray-200 rounded-lg p-3 flex items-center gap-3">
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <FileText className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-blue-600">Google Tài liệu</span>
                    </div>
                    
                    <div className="bg-gray-200 rounded-lg p-3 flex items-center gap-3">
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <FileText className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-blue-600">Google Trang trình bày</span>
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-gray-700">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-normal text-gray-900">Liên kết</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="bg-gray-200 rounded-lg p-3 flex items-center gap-3">
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <FileText className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-blue-600">Trang web</span>
                    </div>
                    
                    <div className="bg-gray-200 rounded-lg p-3 flex items-center gap-3">
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <Play className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-blue-600">YouTube</span>
                    </div>
                  </div>
                </div>

                {/* Paste Text */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-gray-700">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-normal text-gray-900">Dán văn bản</h4>
                  </div>
                  
                  <div className="bg-gray-200 rounded-lg p-3 flex items-center gap-3">
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <FileText className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-blue-600">Văn bản đã sao chép</span>
                  </div>
                </div>
              </div>

              {/* Bottom Progress Bar */}
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
                  <div className="bg-gray-300 h-full rounded-full" style={{ width: '0%' }}></div>
                </div>
                
                <span className="text-sm text-gray-900 font-medium">0/50</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}