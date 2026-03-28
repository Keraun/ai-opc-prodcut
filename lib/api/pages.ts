import type { PageInfo, ModuleData, PageConfig } from './types'
import { request } from './request'

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

export async function getPageConfig(pageId: string): Promise<PageConfig | null> {
  try {
    const result = await request<PageConfig>(`/api/page-config?pageId=${pageId}`)
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
