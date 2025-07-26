'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiService } from '@/lib/api'

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }

    setLoading(true)

    try {
      console.log('Attempting login with:', { email: formData.email })
      
      const response = await apiService.login(formData.email, formData.password)
      
      console.log('Login response:', response)
      
      if (response.success && response.data) {
        // Lưu token và user info
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        toast.success(`Chào mừng ${response.data.user.name}!`)
        router.push('/dashboard')
      } else {
        console.error('Login failed:', response.error)
        toast.error(response.error || 'Đăng nhập thất bại')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Lỗi kết nối đến server')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = (email: string, password: string) => {
    setFormData({ email, password })
  }

  return (
    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg border border-gray-200">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-lg">S</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">SmartDoc</h1>
        <p className="text-gray-600 mt-2">Đăng nhập vào hệ thống</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="admin@smartdoc.com"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••"
              disabled={loading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 px-4 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Đang đăng nhập...
            </>
          ) : (
            'Đăng nhập'
          )}
        </button>
      </form>

      {/* Demo Accounts */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-4 text-center">Tài khoản demo:</p>
        <div className="space-y-2">
          <button 
            onClick={() => handleDemoLogin('admin@smartdoc.com', 'admin123')}
            disabled={loading}
            className="w-full text-left bg-gray-50 hover:bg-gray-100 p-3 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            <div className="font-medium text-gray-900">👑 Admin</div>
            <div className="text-gray-600">admin@smartdoc.com / admin123</div>
          </button>
          <button 
            onClick={() => handleDemoLogin('test@example.com', 'test123')}
            disabled={loading}
            className="w-full text-left bg-gray-50 hover:bg-gray-100 p-3 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            <div className="font-medium text-gray-900">👤 User</div>
            <div className="text-gray-600">test@example.com / test123</div>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          Click để tự động điền thông tin đăng nhập
        </p>
      </div>

      {/* Connection Status */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          API: <span className="font-mono">http://localhost:8000</span>
        </p>
      </div>
    </div>
  )
}