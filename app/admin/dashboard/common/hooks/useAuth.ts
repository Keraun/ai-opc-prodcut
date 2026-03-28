import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { checkAuthStatus, logout as logoutApi } from '@/lib/api-client'
import { User } from '../types'

export function useAuth() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const checkAuth = async () => {
    try {
      const authResult = await checkAuthStatus()

      if (!authResult.authenticated) {
        router.push("/admin")
        return false
      }

      setCurrentUser(authResult.user || null)
      sessionStorage.setItem('currentUser', JSON.stringify(authResult.user))
      return true
    } catch (error) {
      router.push("/admin")
      return false
    }
  }

  const logout = async () => {
    try {
      const success = await logoutApi()
      if (success) {
        sessionStorage.removeItem('currentUser')
        router.push("/admin")
      }
      return success
    } catch (error) {
      return false
    }
  }

  const getCurrentUser = (): User | null => {
    const userStr = sessionStorage.getItem('currentUser')
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch {
        return null
      }
    }
    return null
  }

  const updateCurrentUser = (user: User) => {
    setCurrentUser(user)
    sessionStorage.setItem('currentUser', JSON.stringify(user))
  }

  return {
    currentUser,
    loading,
    checkAuth,
    logout,
    getCurrentUser,
    updateCurrentUser
  }
}
