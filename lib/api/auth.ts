import type { LoginResult, AuthResult } from './types'
import { request } from './request'

/**
 * 用户登录（简化版）
 * @param username - 用户名
 * @param password - 密码
 * @returns 登录是否成功
 */
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

/**
 * 用户登出
 * @returns 登出是否成功
 */
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

/**
 * 检查用户是否已认证
 * @returns 是否已认证
 */
export async function checkAuth(): Promise<boolean> {
  try {
    const result = await request<void>('/api/admin/auth')
    return result.success
  } catch (error) {
    console.error('Error checking auth:', error)
    return false
  }
}

/**
 * 检查用户认证状态（详细信息）
 * @param token - 认证token
 * @param sessionId - 会话ID
 * @returns 认证结果，包含 authenticated 和 user 信息
 */
export async function checkAuthStatus(token?: string, sessionId?: string): Promise<AuthResult> {
  try {
    const params = new URLSearchParams()
    if (token) params.set('token', token)
    if (sessionId) params.set('sessionId', sessionId)
    
    const result = await request<AuthResult>(`/api/admin/auth${params.toString() ? `?${params.toString()}` : ''}`)
    return result.success && result.data ? result.data : { authenticated: false }
  } catch (error) {
    console.error('Error checking auth status:', error)
    return { authenticated: false }
  }
}

/**
 * 用户登录（详细响应版）
 * @param username - 用户名
 * @param password - 密码
 * @returns 登录结果，包含 success、user、requireEmailSetup 和 message
 */
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
      message: result.message,
    }
  } catch (error) {
    console.error('Error logging in:', error)
    return { success: false, message: '登录失败' }
  }
}

/**
 * 设置用户邮箱
 * @param email - 邮箱地址
 * @param username - 用户名（首次登录时需要）
 * @returns 设置结果，包含 success 和 message
 */
export async function setupEmail(email: string, username?: string): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await request<void>('/api/admin/setup-email', {
      method: 'POST',
      body: JSON.stringify({ email, username }),
    })
    return { success: result.success, message: result.message }
  } catch (error) {
    console.error('Error setting up email:', error)
    return { success: false, message: '设置邮箱失败' }
  }
}

/**
 * 发送密码重置验证码
 * @param email - 邮箱地址
 * @returns 发送结果，包含 success 和 message
 */
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

/**
 * 重置密码
 * @param data - 重置密码参数
 * @param data.email - 邮箱地址
 * @param data.code - 验证码
 * @param data.newPassword - 新密码
 * @returns 重置结果，包含 success、username 和 message
 */
export async function resetPassword(data: {
  email: string
  code: string
  newPassword: string
}): Promise<{ success: boolean; username?: string; message?: string }> {
  try {
    const result = await request<{ username?: string }>('/api/admin/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        method: 'email',
        email: data.email,
        code: data.code,
        newPassword: data.newPassword
      }),
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

/**
 * 修改密码
 * @param data - 修改密码参数
 * @param data.username - 用户名
 * @param data.oldPassword - 旧密码
 * @param data.newPassword - 新密码
 * @returns 修改结果，包含 success、user 和 message
 */
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

