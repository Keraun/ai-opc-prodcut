import type { ModuleRegistration } from '@/modules/types'

interface ApiResponse<T> {
  code: number
  success: boolean
  message?: string
  data?: T
}

interface ModuleInfo {
  moduleId: string
  moduleName: string
  category?: string
  schema?: Record<string, unknown>
  defaultData?: Record<string, unknown>
}

interface PageInfo {
  id: string
  name: string
  slug: string
  moduleInstanceIds: string[]
  modules: ModuleData[]
  status?: 'draft' | 'published' | 'offline'
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
}

interface ModuleData {
  moduleId: string
  moduleName: string
  moduleInstanceId: string
  data: Record<string, unknown>
}

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
  
  const result = await response.json()
  return result as ApiResponse<T>
}

export async function getAvailableModules(): Promise<ModuleInfo[]> {
  try {
    const result = await request<ModuleInfo[]>('/api/modules')
    return result.success && result.data ? result.data : []
  } catch (error) {
    console.error('Error fetching available modules:', error)
    return []
  }
}

export async function getAvailableModuleIds(): Promise<string[]> {
  try {
    const result = await request<string[]>('/api/modules?action=available')
    return result.success && result.data ? result.data : []
  } catch (error) {
    console.error('Error fetching available module ids:', error)
    return []
  }
}

export async function getModuleSchema(moduleId: string): Promise<Record<string, unknown> | null> {
  try {
    const result = await request<Record<string, unknown>>(`/api/modules/${moduleId}/schema`)
    return result.success && result.data ? result.data : null
  } catch (error) {
    console.error('Error fetching module schema:', error)
    return null
  }
}

export async function getModuleInfo(moduleId: string): Promise<{
  schema?: Record<string, unknown>
  defaultData?: Record<string, unknown>
  currentData?: Record<string, unknown>
} | null> {
  try {
    const result = await request<{
      schema: Record<string, unknown>
      defaultData: Record<string, unknown>
      currentData: Record<string, unknown>
    }>(`/api/modules/${moduleId}`)
    return result.success && result.data ? result.data : null
  } catch (error) {
    console.error('Error fetching module info:', error)
    return null
  }
}

export async function getPageDetail(pageId: string): Promise<PageInfo | null> {
  try {
    const result = await request<PageInfo>(`/api/admin/pages/${pageId}`)
    return result.success && result.data ? result.data : null
  } catch (error) {
    console.error('Error fetching page detail:', error)
    return null
  }
}

export async function getPageList(): Promise<PageInfo[]> {
  try {
    const result = await request<PageInfo[]>('/api/admin/pages')
    return result.success && result.data ? result.data : []
  } catch (error) {
    console.error('Error fetching page list:', error)
    return []
  }
}

export async function createPage(data: {
  name: string
  slug: string
  type?: 'static' | 'dynamic'
  dynamicParam?: string
}): Promise<{ success: boolean; pageId?: string }> {
  try {
    const result = await request<{ pageId: string }>('/api/admin/pages', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return { success: result.success, pageId: result.data?.pageId }
  } catch (error) {
    console.error('Error creating page:', error)
    return { success: false }
  }
}

export async function updatePage(pageId: string, data: {
  name?: string
  slug?: string
  modules?: ModuleData[]
}): Promise<boolean> {
  try {
    const result = await request<void>(`/api/admin/pages/${pageId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return result.success
  } catch (error) {
    console.error('Error updating page:', error)
    return false
  }
}

export async function publishPage(pageId: string): Promise<boolean> {
  try {
    const result = await request<void>(`/api/admin/pages/${pageId}/status`, {
      method: 'POST',
      body: JSON.stringify({ action: 'publish' }),
    })
    return result.success
  } catch (error) {
    console.error('Error publishing page:', error)
    return false
  }
}

export async function offlinePage(pageId: string): Promise<boolean> {
  try {
    const result = await request<void>(`/api/admin/pages/${pageId}/status`, {
      method: 'POST',
      body: JSON.stringify({ action: 'offline' }),
    })
    return result.success
  } catch (error) {
    console.error('Error setting page offline:', error)
    return false
  }
}

export async function deletePage(pageId: string): Promise<boolean> {
  try {
    const result = await request<void>(`/api/admin/pages/${pageId}`, {
      method: 'DELETE',
    })
    return result.success
  } catch (error) {
    console.error('Error deleting page:', error)
    return false
  }
}

export async function getConfig(path: string): Promise<Record<string, unknown>> {
  try {
    const result = await request<Record<string, unknown>>(`/api/config?path=${encodeURIComponent(path)}`)
    return result.success && result.data ? result.data : {}
  } catch (error) {
    console.error('Error fetching config:', error)
    return {}
  }
}

export async function setConfig(path: string, value: unknown): Promise<boolean> {
  try {
    const result = await request<void>('/api/config', {
      method: 'POST',
      body: JSON.stringify({ path, value }),
    })
    return result.success
  } catch (error) {
    console.error('Error setting config:', error)
    return false
  }
}

export async function getAdminConfig(): Promise<Record<string, unknown>> {
  try {
    const result = await request<Record<string, unknown>>('/api/admin/config')
    return result.success && result.data ? result.data : {}
  } catch (error) {
    console.error('Error fetching admin config:', error)
    return {}
  }
}

export async function updateAdminConfig(config: Record<string, unknown>): Promise<boolean> {
  try {
    const result = await request<void>('/api/admin/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    })
    return result.success
  } catch (error) {
    console.error('Error updating admin config:', error)
    return false
  }
}

export async function exportConfig(): Promise<Blob | null> {
  try {
    const response = await fetch('/api/admin/config/export')
    if (response.ok) {
      return await response.blob()
    }
    return null
  } catch (error) {
    console.error('Error exporting config:', error)
    return null
  }
}

export async function importConfig(file: File): Promise<boolean> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/admin/config/import', {
      method: 'POST',
      body: formData,
    })
    
    const result = await response.json()
    return result.success
  } catch (error) {
    console.error('Error importing config:', error)
    return false
  }
}

export async function resetWebsite(username: string): Promise<boolean> {
  try {
    const result = await request<void>('/api/admin/reset-website', {
      method: 'POST',
      body: JSON.stringify({ username }),
    })
    return result.success
  } catch (error) {
    console.error('Error resetting website:', error)
    return false
  }
}

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

export async function checkAuthStatus(): Promise<{ authenticated: boolean; user?: { username: string; role: string } }> {
  try {
    const result = await request<{ authenticated: boolean; user?: { username: string; role: string } }>('/api/admin/auth')
    return result.success && result.data ? result.data : { authenticated: false }
  } catch (error) {
    console.error('Error checking auth status:', error)
    return { authenticated: false }
  }
}

export async function loginWithResponse(username: string, password: string): Promise<{
  success: boolean
  user?: { username: string; role: string }
  requireEmailSetup?: boolean
  showSuperAdminToken?: boolean
  superAdminToken?: string
  message?: string
}> {
  try {
    const result = await request<{
      user?: { username: string; role: string }
      requireEmailSetup?: boolean
      showSuperAdminToken?: boolean
      superAdminToken?: string
    }>('/api/admin/login', {
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

// ==================== Module API ====================

export async function getModuleInstanceData(
  moduleInstanceId: string
): Promise<Record<string, unknown> | null> {
  try {
    const result = await request<Record<string, unknown>>(`/api/modules?moduleInstanceId=${moduleInstanceId}`)
    return result.success && result.data ? result.data : null
  } catch (error) {
    console.error('Error fetching module instance data:', error)
    return null
  }
}

export async function getModule(moduleId: string): Promise<ModuleData | null> {
  try {
    const result = await request<ModuleData>(`/api/modules?moduleId=${moduleId}`)
    return result.success && result.data ? result.data : null
  } catch (error) {
    console.error('Error fetching module:', error)
    return null
  }
}

export async function getModuleTemplate(moduleId: string): Promise<ModuleRegistration | null> {
  try {
    const result = await request<ModuleRegistration>(`/api/modules?action=template&moduleId=${moduleId}`)
    return result.success && result.data ? result.data : null
  } catch (error) {
    console.error('Error fetching module template:', error)
    return null
  }
}

export async function updateModuleInstance(
  moduleInstanceId: string, 
  data: Record<string, unknown>
): Promise<boolean> {
  try {
    const result = await request<void>('/api/modules', {
      method: 'POST',
      body: JSON.stringify({ moduleInstanceId, data }),
    })
    return result.success
  } catch (error) {
    console.error('Error updating module instance:', error)
    return false
  }
}

export async function getPageConfig(pageId: string): Promise<{
  pageId: string
  layout: string
  modules: ModuleData[]
  config: Record<string, unknown>
} | null> {
  try {
    const result = await request<{
      pageId: string
      layout: string
      modules: ModuleData[]
      config: Record<string, unknown>
    }>(`/api/page-config?pageId=${pageId}`)
    return result.success && result.data ? result.data : null
  } catch (error) {
    console.error('Error fetching page config:', error)
    return null
  }
}

export async function getPageModules(pageId: string): Promise<ModuleData[]> {
  try {
    const pageConfig = await getPageConfig(pageId)
    return pageConfig?.modules || []
  } catch (error) {
    console.error('Error fetching page modules:', error)
    return []
  }
}

export async function updatePageModules(
  pageId: string, 
  modules: ModuleData[]
): Promise<boolean> {
  try {
    const result = await request<void>('/api/page-config', {
      method: 'POST',
      body: JSON.stringify({ pageId, modules }),
    })
    return result.success
  } catch (error) {
    console.error('Error updating page modules:', error)
    return false
  }
}

// ==================== Contact API ====================

export async function submitContactForm(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
      body: formData
    })
    
    const result = await response.json()
    return {
      success: result.success,
      message: result.message || (result.success ? '提交成功' : '提交失败')
    }
  } catch (error) {
    console.error('Error submitting contact form:', error)
    return { success: false, message: '提交失败，请稍后重试' }
  }
}
