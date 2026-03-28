import type { LoginResult, AuthResult } from './types'
import { request } from './request'

export async function login(username: string, password: string): Promise<boolean> {
  try {
    const result = await request<void>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    return result.success
  } catch (error) {
    console.error('Error logging in:', error)
    return false
  }
}

export async function logout(): Promise<boolean> {
  try {
    const result = await request<void>('/api/admin/logout', {
      method: 'POST',
    })
    return result.success
  } catch (error) {
    console.error('Error logging out:', error)
    return false
  }
}

export async function checkAuth(): Promise<boolean> {
  try {
    const result = await request<void>('/api/admin/auth')
    return result.success
  } catch (error) {
    console.error('Error checking auth:', error)
    return false
  }
}

export async function checkAuthStatus(): Promise<AuthResult> {
  try {
    const result = await request<AuthResult>('/api/admin/auth')
    return result.success && result.data ? result.data : { authenticated: false }
  } catch (error) {
    console.error('Error checking auth status:', error)
    return { authenticated: false }
  }
}

export async function loginWithResponse(username: string, password: string): Promise<LoginResult> {
  try {
    const result = await request<LoginResult>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    return {
      success: result.success,
      user: result.data?.user,
      requireEmailSetup: result.data?.requireEmailSetup,
      showSuperAdminToken: result.data?.showSuperAdminToken,
      superAdminToken: result.data?.superAdminToken,
      message: result.message,
    }
  } catch (error) {
    console.error('Error logging in:', error)
    return { success: false, message: '登录失败' }
  }
}

export async function setupEmail(email: string): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await request<void>('/api/admin/setup-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
    return { success: result.success, message: result.message }
  } catch (error) {
    console.error('Error setting up email:', error)
    return { success: false, message: '设置邮箱失败' }
  }
}

export async function sendResetCode(email: string): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await request<void>('/api/admin/send-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
    return { success: result.success, message: result.message }
  } catch (error) {
    console.error('Error sending reset code:', error)
    return { success: false, message: '发送验证码失败' }
  }
}

export async function resetPassword(data: {
  method: string
  username?: string
  token?: string
  email?: string
  code?: string
  newPassword: string
}): Promise<{ success: boolean; username?: string; message?: string }> {
  try {
    const result = await request<{ username?: string }>('/api/admin/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return {
      success: result.success,
      username: result.data?.username,
      message: result.message,
    }
  } catch (error) {
    console.error('Error resetting password:', error)
    return { success: false, message: '重置密码失败' }
  }
}

export async function changePassword(data: {
  username: string
  oldPassword: string
  newPassword: string
}): Promise<{ success: boolean; user?: any; message?: string }> {
  try {
    const result = await request<{ user: any }>('/api/admin/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return {
      success: result.success,
      user: result.data?.user,
      message: result.message,
    }
  } catch (error) {
    console.error('Error changing password:', error)
    return { success: false, message: '修改密码失败' }
  }
}

export async function getSuperAdminToken(password: string): Promise<{
  success: boolean
  token?: string
  message?: string
}> {
  try {
    const result = await request<{ token: string }>('/api/admin/super-admin-token', {
      method: 'POST',
      body: JSON.stringify({ password }),
    })
    return {
      success: result.success,
      token: result.data?.token,
      message: result.message,
    }
  } catch (error) {
    console.error('Error getting super admin token:', error)
    return { success: false, message: '获取口令失败' }
  }
}
