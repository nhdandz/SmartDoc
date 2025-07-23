'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LoginForm from '@/components/auth/LoginForm'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
      router.push('/dashboard')
    }
  }, [router])

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#edeffa' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#edeffa' }}>
      <LoginForm />
    </div>
  )
}