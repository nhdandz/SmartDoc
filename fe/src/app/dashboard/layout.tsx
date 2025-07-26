'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Home,
  FileText,
  Search,
  MessageSquare,
  FileImage,
  BarChart3,
  Settings,
  LogOut,
  X,
  Menu,
  Bell,
  AlertCircle
} from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { User } from '@/types'
import { apiService } from '@/lib/api'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Bảng điều khiển', href: '/dashboard', icon: Home },
  { name: 'Quản lý văn bản', href: '/dashboard/documents', icon: FileText },
  { name: 'Số hóa văn bản', href: '/dashboard/ocr', icon: FileImage },
  { name: 'Tìm kiếm', href: '/dashboard/search', icon: Search },
  { name: 'Hỏi đáp', href: '/dashboard/qa', icon: MessageSquare },
  { name: 'Báo cáo', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Cài đặt', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [connectionError, setConnectionError] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAuth()
  }, [router])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (!token) {
      router.push('/')
      return
    }

    // Try to use saved user first
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        console.error('Error parsing saved user:', e)
      }
    }

    // Verify with API
    try {
      const response = await apiService.getCurrentUser()
      
      if (response.success && response.data) {
        setUser(response.data)
        localStorage.setItem('user', JSON.stringify(response.data))
        setConnectionError(false)
      } else {
        console.error('Auth verification failed:', response.error)
        // If API call fails but we have a token, try to continue with saved user
        if (!savedUser) {
          handleLogout()
        } else {
          setConnectionError(true)
          toast.error('Không thể kết nối đến server, sử dụng dữ liệu đã lưu')
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
      if (!savedUser) {
        handleLogout()
      } else {
        setConnectionError(true)
        toast.error('Không thể kết nối đến server')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await apiService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#edeffa' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang xác thực...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#edeffa' }}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Lỗi xác thực</h2>
          <p className="text-gray-600 mb-4">Vui lòng đăng nhập lại</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Về trang đăng nhập
          </button>
        </div>
      </div>
    )
  }

  // Special handling for main dashboard page - no sidebar
  if (pathname === '/dashboard') {
    return <>{children}</>
  }

  return (
    <div className="h-screen bg-gray-100 flex" style={{ background: '#edeffa' }}>
      {/* Connection Error Banner */}
      {connectionError && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center text-sm z-50">
          <AlertCircle className="inline w-4 h-4 mr-2" />
          Không thể kết nối đến server. Một số tính năng có thể bị hạn chế.
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        'fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 lg:translate-x-0 transition-transform lg:static lg:inset-auto',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        connectionError ? 'mt-10' : ''
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">SmartDoc</h1>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
                {connectionError && (
                  <p className="text-xs text-yellow-600">Chế độ offline</p>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={clsx(
          "bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0",
          connectionError ? 'mt-10' : ''
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 mr-4"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm tài liệu..."
                    className="pl-10 pr-4 py-2 w-96 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={connectionError}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}