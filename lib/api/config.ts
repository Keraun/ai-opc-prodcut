import { request } from './request'

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
