import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { checkAuthStatus, logout as logoutApi } from '@/lib/api-client'
import { User } from '../types'

export function useAuth() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const checkAuth = useCallback(async () => {
    try {
      console.log('[Dashboard CheckAuth] Checking auth status...')
      const authResult = await checkAuthStatus()
      console.log('[Dashboard CheckAuth] Auth result:', authResult)

      if (!authResult.authenticated) {
        console.log('[Dashboard CheckAuth] Not authenticated, redirecting to login')
        await logoutApi()
        sessionStorage.removeItem('currentUser')
        router.push("/admin")
        return false
      }

      console.log('[Dashboard CheckAuth] Authenticated, user:', authResult.user)
      console.log('[Dashboard CheckAuth] User role:', authResult.user?.role)
      setCurrentUser(authResult.user || null)
      sessionStorage.setItem('currentUser', JSON.stringify(authResult.user))
      return true
    } catch (error) {
      console.error('[Dashboard CheckAuth] Error:', error)
      await logoutApi()
      sessionStorage.removeItem('currentUser')
      router.push("/admin")
      return false
    }
  }, [router])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    const validateSession = async () => {
      const authResult = await checkAuthStatus()
      if (!authResult.authenticated) {
        await logoutApi()
        sessionStorage.removeItem('currentUser')
        router.push("/admin")
      }
    }

    interval = setInterval(validateSession, 30000)

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [router])

  const logout = async () => {
    try {
      const success = await logoutApi()
      if (success) {
        sessionStorage.removeItem('currentUser')
        router.push("/admin")
      }
      return success
    } catch (error) {
      sessionStorage.removeItem('currentUser')
      router.push("/admin")
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
