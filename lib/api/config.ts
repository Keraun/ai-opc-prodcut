import { request } from './request'

/**
 * 根据路径获取配置值
 * @param path - 配置路径
 * @returns 配置值对象，失败时返回空对象
 */
export async function getConfig(path: string): Promise<Record<string, unknown>> {
  try {
    const result = await request<Record<string, unknown>>(`/api/config?path=${encodeURIComponent(path)}`)
    return result.success && result.data ? result.data : {}
  } catch (error) {
    console.error('Error fetching config:', error)
    return {}
  }
}

/**
 * 设置配置值
 * @param path - 配置路径
 * @param value - 配置值
 * @returns 设置是否成功
 */
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

/**
 * 获取管理后台配置
 * @returns 管理后台配置对象，失败时返回空对象
 */
export async function getAdminConfig(): Promise<Record<string, unknown>> {
  try {
    const result = await request<Record<string, unknown>>('/api/admin/config')
    return result.success && result.data ? result.data : {}
  } catch (error) {
    console.error('Error fetching admin config:', error)
    return {}
  }
}

/**
 * 更新管理后台配置
 * @param config - 配置对象
 * @returns 更新是否成功
 */
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

/**
 * 导出配置文件
 * @returns 配置文件 Blob 对象，失败时返回 null
 */
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

/**
 * 导入配置文件
 * @param file - 配置文件
 * @returns 导入是否成功
 */
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

/**
 * 获取表单 Schema
 * @param type - Schema 类型（可选）
 * @returns Schema 对象，失败时返回空对象
 */
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

/**
 * 获取配置的历史版本
 * @param type - 配置类型
 * @returns 版本信息，包含 success、data、version 和 message
 */
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

/**
 * 还原配置到上一个版本
 * @param type - 配置类型
 * @returns 还原结果，包含 success 和 message
 */
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

/**
 * 保存管理后台配置（带类型）
 * @param type - 配置类型
 * @param data - 配置数据
 * @returns 保存结果，包含 success 和 message
 */
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

/**
 * 获取主题配置
 * @returns 主题配置对象，包含 currentTheme 和 themes，失败时返回 null
 */
export async function getThemeConfig(): Promise<{
  currentTheme?: string
  themes?: Record<string, any>
} | null> {
  try {
    const result = await request<any[]>('/api/admin/themes')
    if (!result.success || !result.data) {
      return null
    }
    
    const themeList = result.data
    const themes: Record<string, any> = {}
    let currentTheme = 'modern'
    
    themeList.forEach((theme: any) => {
      themes[theme.themeId] = {
        ...theme.themeConfig,
        themeName: theme.themeName
      }
      if (theme.isCurrent) {
        currentTheme = theme.themeId
      }
    })
    
    return {
      currentTheme,
      themes
    }
  } catch (error) {
    console.error('Error fetching theme config:', error)
    return null
  }
}

/**
 * 获取主题列表
 * @param onlyCurrent - 是否只获取当前主题
 * @returns 主题列表，失败时返回空数组
 */
export async function getThemes(onlyCurrent: boolean = false): Promise<any[]> {
  try {
    const url = onlyCurrent ? '/api/admin/themes?onlyCurrent=true' : '/api/admin/themes'
    const result = await request<any[]>(url)
    return result.success && result.data ? result.data : []
  } catch (error) {
    console.error('Error fetching themes:', error)
    return []
  }
}

/**
 * 创建主题
 * @param themeData - 主题数据
 * @returns 创建结果，包含 success 和 message
 */
export async function createTheme(themeData: any): Promise<{ success: boolean; message?: string; themeId?: string }> {
  try {
    const result = await request<{ themeId: string }>('/api/admin/themes?action=create', {
      method: 'POST',
      body: JSON.stringify(themeData)
    })
    return {
      success: result.success,
      message: result.message,
      themeId: result.data?.themeId
    }
  } catch (error) {
    console.error('Error creating theme:', error)
    return { success: false, message: '创建主题失败' }
  }
}

/**
 * 更新主题
 * @param themeData - 主题数据
 * @returns 更新结果，包含 success 和 message
 */
export async function updateTheme(themeData: any): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await request('/api/admin/themes?action=update', {
      method: 'POST',
      body: JSON.stringify(themeData)
    })
    return {
      success: result.success,
      message: result.message
    }
  } catch (error) {
    console.error('Error updating theme:', error)
    return { success: false, message: '更新主题失败' }
  }
}

/**
 * 删除主题
 * @param themeId - 主题ID
 * @returns 删除结果，包含 success 和 message
 */
export async function deleteTheme(themeId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await request('/api/admin/themes?action=delete', {
      method: 'POST',
      body: JSON.stringify({ themeId })
    })
    return {
      success: result.success,
      message: result.message
    }
  } catch (error) {
    console.error('Error deleting theme:', error)
    return { success: false, message: '删除主题失败' }
  }
}

/**
 * 设置当前主题
 * @param themeId - 主题ID
 * @returns 设置结果，包含 success 和 message
 */
export async function setCurrentTheme(themeId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await request('/api/admin/themes?action=setCurrent', {
      method: 'POST',
      body: JSON.stringify({ themeId })
    })
    return {
      success: result.success,
      message: result.message
    }
  } catch (error) {
    console.error('Error setting current theme:', error)
    return { success: false, message: '设置主题失败' }
  }
}

export async function getSiteRootConfig(): Promise<Record<string, any>> {
  try {
    const result = await request<Record<string, any>>('/api/admin/config?type=site-root')
    return result.success && result.data ? result.data : {}
  } catch (error) {
    console.error('Error fetching site root config:', error)
    return {}
  }
}

export async function saveSiteRootConfig(data: any): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await request<void>('/api/admin/config', {
      method: 'POST',
      body: JSON.stringify({ type: 'site-root', data }),
    })
    return { success: result.success, message: result.message }
  } catch (error) {
    console.error('Error saving site root config:', error)
    return { success: false, message: '配置保存失败' }
  }
}

export async function syncSiteRootToPages(data: any): Promise<{ 
  success: boolean
  message?: string
  syncedPages?: string[]
}> {
  try {
    const result = await request<{ syncedPages: string[] }>('/api/admin/site-config/sync', {
      method: 'POST',
      body: JSON.stringify({ siteRootData: data }),
    })
    return {
      success: result.success,
      message: result.message,
      syncedPages: result.data?.syncedPages
    }
  } catch (error) {
    console.error('Error syncing site root to pages:', error)
    return { success: false, message: '同步失败' }
  }
}

export async function getSiteFooterConfig(): Promise<Record<string, any>> {
  try {
    const result = await request<Record<string, any>>('/api/admin/config?type=site-footer')
    return result.success && result.data ? result.data : {}
  } catch (error) {
    console.error('Error fetching site footer config:', error)
    return {}
  }
}

export async function saveSiteFooterConfig(data: any): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await request<void>('/api/admin/config', {
      method: 'POST',
      body: JSON.stringify({ type: 'site-footer', data }),
    })
    return { success: result.success, message: result.message }
  } catch (error) {
    console.error('Error saving site footer config:', error)
    return { success: false, message: '配置保存失败' }
  }
}

export async function syncGlobalConfig(options: {
  siteRootData?: any
  siteFooterData?: any
}): Promise<{ 
  success: boolean
  message?: string
}> {
  try {
    const result = await request<{ results: any }>('/api/admin/site-config/sync', {
      method: 'POST',
      body: JSON.stringify(options),
    })
    return {
      success: result.success,
      message: result.message
    }
  } catch (error) {
    console.error('Error syncing global config:', error)
    return { success: false, message: '同步失败' }
  }
}

export async function getSystemInfo(): Promise<{
  success: boolean
  data?: {
    port: string
    ipAddress: string
    hostname: string
    platform: string
    nodeVersion: string
    uptime: number
    environment: string
  }
  message?: string
}> {
  try {
    const result = await request<any>('/api/admin/system/info')
    return {
      success: result.success,
      data: result.data,
      message: result.message
    }
  } catch (error) {
    console.error('Error fetching system info:', error)
    return { success: false, message: '获取系统信息失败' }
  }
}

export async function restartSystem(): Promise<{
  success: boolean
  message?: string
}> {
  try {
    const result = await request<void>('/api/admin/system/restart', {
      method: 'POST'
    })
    return {
      success: result.success,
      message: result.message
    }
  } catch (error) {
    console.error('Error restarting system:', error)
    return { success: false, message: '重启服务失败' }
  }
}
