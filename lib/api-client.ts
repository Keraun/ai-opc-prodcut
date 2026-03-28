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
