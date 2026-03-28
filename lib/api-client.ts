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
  const isFormData = options.body instanceof FormData
  const headers: Record<string, string> = { ...options.headers as Record<string, string> }
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }
  
  const response = await fetch(url, {
    headers,
    ...options,
  })
  
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    const result = await response.json()
    return result as ApiResponse<T>
  }
  
  return {
    code: response.status,
    success: response.ok,
    message: response.ok ? '操作成功' : '操作失败',
  } as ApiResponse<T>
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
    
    const result = await request<void>('/api/admin/config/import', {
      method: 'POST',
      body: formData,
    })
    
    return result.success
  } catch (error) {
    console.error('Error importing config:', error)
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
    const result = await request<void>('/api/contact', {
      method: 'POST',
      body: formData
    })
    
    return {
      success: result.success,
      message: result.message || (result.success ? '提交成功' : '提交失败')
    }
  } catch (error) {
    console.error('Error submitting contact form:', error)
    return { success: false, message: '提交失败，请稍后重试' }
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

export async function getSchema(type?: string): Promise<Record<string, any>> {
  try {
    const url = type ? `/api/admin/schema?type=${type}` : '/api/admin/schema'
    const result = await request<Record<string, any>>(url)
    return result.success && result.data ? result.data : {}
  } catch (error) {
    console.error('Error fetching schema:', error)
    return {}
  }
}

export async function getConfigVersion(type: string): Promise<{
  success: boolean
  data?: any
  version?: any
  message?: string
}> {
  try {
    const result = await request<any>(`/api/admin/config/version?type=${type}&action=previous`)
    return {
      success: result.success,
      data: result.data,
      version: (result as any).version,
      message: result.message,
    }
  } catch (error) {
    console.error('Error fetching config version:', error)
    return { success: false, message: '获取版本失败' }
  }
}

export async function restoreConfigVersion(type: string): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await request<void>('/api/admin/config/restore', {
      method: 'POST',
      body: JSON.stringify({ type }),
    })
    return { success: result.success, message: result.message }
  } catch (error) {
    console.error('Error restoring config version:', error)
    return { success: false, message: '还原版本失败' }
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

export async function createPageWithResponse(data: {
  name: string
  slug: string
  type?: 'static' | 'dynamic'
  dynamicParam?: string
}): Promise<{ success: boolean; pageId?: string; message?: string }> {
  try {
    const result = await request<{ pageId: string }>('/api/admin/pages', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return { success: result.success, pageId: result.data?.pageId, message: result.message }
  } catch (error) {
    console.error('Error creating page:', error)
    return { success: false, message: '创建页面失败' }
  }
}

export async function getPageUsage(pageId: string): Promise<string[]> {
  try {
    const result = await request<{ usedBy: string[] }>(`/api/admin/pages/${pageId}/usage`)
    return result.success && result.data ? result.data.usedBy : []
  } catch (error) {
    console.error('Error fetching page usage:', error)
    return []
  }
}

export async function getFeishuSchema(): Promise<{ success: boolean; data?: any[]; message?: string }> {
  try {
    const result = await request<any[]>('/api/feishu/schema')
    return { success: result.success, data: result.data, message: result.message }
  } catch (error) {
    console.error('Error fetching feishu schema:', error)
    return { success: false, message: '获取表格字段失败' }
  }
}

export async function createFeishuTable(): Promise<{
  success: boolean
  data?: { tableId: string; tableLink: string }
  message?: string
}> {
  try {
    const result = await request<{ tableId: string; tableLink: string }>('/api/feishu/create-table', {
      method: 'POST',
    })
    return { success: result.success, data: result.data, message: result.message }
  } catch (error) {
    console.error('Error creating feishu table:', error)
    return { success: false, message: '生成飞书数据表失败' }
  }
}

export async function getAccounts(): Promise<{ success: boolean; accounts?: any[] }> {
  try {
    const result = await request<any[]>('/api/admin/accounts')
    return { success: result.success, accounts: result.data }
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return { success: false }
  }
}

export async function addAccount(account: {
  username: string
  password: string
  email: string
  remark?: string
}): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await request<void>('/api/admin/accounts', {
      method: 'POST',
      body: JSON.stringify(account),
    })
    return { success: result.success, message: result.message }
  } catch (error) {
    console.error('Error adding account:', error)
    return { success: false, message: '添加账号失败' }
  }
}

export async function deleteAccount(username: string): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await request<void>(`/api/admin/accounts/${username}`, {
      method: 'DELETE',
    })
    return { success: result.success, message: result.message }
  } catch (error) {
    console.error('Error deleting account:', error)
    return { success: false, message: '删除账号失败' }
  }
}

export async function updateAccount(username: string, data: {
  password?: string
  email: string
  remark?: string
}): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await request<void>(`/api/admin/accounts/${username}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return { success: result.success, message: result.message }
  } catch (error) {
    console.error('Error updating account:', error)
    return { success: false, message: '修改账号失败' }
  }
}

export async function getArticles(): Promise<any[]> {
  try {
    const result = await request<any[]>('/api/articles')
    return result.success && result.data ? result.data : []
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

export async function createArticle(data: any): Promise<{ success: boolean; article?: any; message?: string }> {
  try {
    const result = await request<any>('/api/articles', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return { success: result.success, article: result.data, message: result.message }
  } catch (error) {
    console.error('Error creating article:', error)
    return { success: false, message: '创建文章失败' }
  }
}

export async function updateArticle(data: any): Promise<{ success: boolean; article?: any; message?: string }> {
  try {
    const result = await request<any>('/api/articles', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return { success: result.success, article: result.data, message: result.message }
  } catch (error) {
    console.error('Error updating article:', error)
    return { success: false, message: '更新文章失败' }
  }
}

export async function deleteArticle(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await request<void>(`/api/articles?id=${id}`, {
      method: 'DELETE',
    })
    return { success: result.success, message: result.message }
  } catch (error) {
    console.error('Error deleting article:', error)
    return { success: false, message: '删除文章失败' }
  }
}

export async function updatePageModulesApi(pageId: string, modules: any[]): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await request<void>(`/api/admin/pages/${pageId}`, {
      method: 'PUT',
      body: JSON.stringify({ modules }),
    })
    return { success: result.success, message: result.message }
  } catch (error) {
    console.error('Error updating page modules:', error)
    return { success: false, message: '保存失败' }
  }
}

export async function publishPageApi(pageId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await request<void>(`/api/admin/pages/${pageId}/status`, {
      method: 'POST',
      body: JSON.stringify({ action: 'publish' }),
    })
    return { success: result.success, message: result.message }
  } catch (error) {
    console.error('Error publishing page:', error)
    return { success: false, message: '发布失败' }
  }
}

export async function saveAdminConfigApi(type: string, data: any): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await request<void>('/api/admin/config', {
      method: 'POST',
      body: JSON.stringify({ type, data }),
    })
    return { success: result.success, message: result.message }
  } catch (error) {
    console.error('Error saving admin config:', error)
    return { success: false, message: '配置保存失败' }
  }
}

export async function getArticleById(id: string): Promise<any | null> {
  try {
    const result = await request<any>(`/api/articles?id=${id}`)
    return result.success && result.data ? result.data : null
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

export async function getPagePreview(pageId: string): Promise<{
  success: boolean
  pageName?: string
  modules?: any[]
  message?: string
}> {
  try {
    const pageResult = await request<any>(`/api/admin/pages/${pageId}`)
    if (!pageResult.success || !pageResult.data) {
      return { success: false, message: '获取页面数据失败' }
    }

    const previewResult = await request<{ pageName: string; modules: any[] }>(`/api/admin/pages/${pageId}/preview`, {
      method: 'POST',
      body: JSON.stringify({ modules: pageResult.data.modules || [] }),
    })

    return {
      success: previewResult.success,
      pageName: previewResult.data?.pageName,
      modules: previewResult.data?.modules,
      message: previewResult.message,
    }
  } catch (error) {
    console.error('Error fetching page preview:', error)
    return { success: false, message: '加载预览失败' }
  }
}

export async function getModulePreview(moduleId: string): Promise<{
  success: boolean
  moduleId?: string
  moduleName?: string
  defaultData?: Record<string, unknown>
  message?: string
}> {
  try {
    const result = await request<{
      moduleId: string
      moduleName: string
      defaultData: Record<string, unknown>
    }>(`/api/modules/${moduleId}/preview`)
    return {
      success: result.success,
      moduleId: result.data?.moduleId,
      moduleName: result.data?.moduleName,
      defaultData: result.data?.defaultData,
      message: result.message,
    }
  } catch (error) {
    console.error('Error fetching module preview:', error)
    return { success: false, message: '加载模块信息失败' }
  }
}

export async function getThemeConfig(): Promise<{
  currentTheme?: string
  themes?: Record<string, any>
} | null> {
  try {
    const result = await request<{ currentTheme: string; themes: Record<string, any> }>('/api/config?type=theme')
    return result.success && result.data ? result.data : null
  } catch (error) {
    console.error('Error fetching theme config:', error)
    return null
  }
}

export async function importDatabase(file: File): Promise<{
  success: boolean
  message?: string
  backupCreated?: {
    filename: string
    path: string
    timestamp: string
  }
}> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const result = await request<{
      message: string
      backupCreated: {
        filename: string
        path: string
        timestamp: string
      }
    }>('/api/admin/config/import', {
      method: 'POST',
      body: formData
    })
    return {
      success: result.success,
      message: result.message,
      backupCreated: result.data?.backupCreated
    }
  } catch (error) {
    console.error('Error importing database:', error)
    return { success: false, message: '数据库导入失败' }
  }
}

export async function resetWebsite(username: string): Promise<{
  success: boolean
  message?: string
  backupCreated?: {
    filename: string
    path: string
    timestamp: string
  }
  tables?: string[]
}> {
  try {
    const result = await request<{
      message: string
      backupCreated: {
        filename: string
        path: string
        timestamp: string
      }
      tables: string[]
    }>('/api/admin/reset-website', {
      method: 'POST',
      body: JSON.stringify({ username })
    })
    return {
      success: result.success,
      message: result.message,
      backupCreated: result.data?.backupCreated,
      tables: result.data?.tables
    }
  } catch (error) {
    console.error('Error resetting website:', error)
    return { success: false, message: '网站恢复失败' }
  }
}

export async function checkDefaultDb(): Promise<{
  success: boolean
  exists?: boolean
  message?: string
}> {
  try {
    const result = await request<{ exists: boolean }>('/api/admin/reset-website?action=check-default')
    return {
      success: result.success,
      exists: result.data?.exists,
      message: result.message
    }
  } catch (error) {
    console.error('Error checking default db:', error)
    return { success: false, message: '检查默认数据库失败' }
  }
}

export async function validateDatabase(): Promise<{
  success: boolean
  valid?: boolean
  message?: string
  tables?: string[]
}> {
  try {
    const result = await request<{ valid: boolean; tables: string[] }>('/api/admin/reset-website?action=validate')
    return {
      success: result.success,
      valid: result.data?.valid,
      tables: result.data?.tables,
      message: result.message
    }
  } catch (error) {
    console.error('Error validating database:', error)
    return { success: false, message: '验证数据库失败' }
  }
}
