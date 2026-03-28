import type { PageInfo, ModuleData, PageConfig } from './types'
import { request } from './request'

/**
 * 获取页面详情
 * @param pageId - 页面 ID
 * @returns 页面信息对象，失败时返回 null
 */
export async function getPageDetail(pageId: string): Promise<PageInfo | null> {
  try {
    const result = await request<PageInfo>(`/api/admin/pages/${pageId}`)
    return result.success && result.data ? result.data : null
  } catch (error) {
    console.error('Error fetching page detail:', error)
    return null
  }
}

/**
 * 获取所有页面列表
 * @returns 页面信息数组，失败时返回空数组
 */
export async function getPageList(): Promise<PageInfo[]> {
  try {
    const result = await request<PageInfo[]>('/api/admin/pages')
    return result.success && result.data ? result.data : []
  } catch (error) {
    console.error('Error fetching page list:', error)
    return []
  }
}

/**
 * 创建新页面
 * @param data - 页面创建参数
 * @param data.name - 页面名称
 * @param data.slug - 页面路径标识
 * @param data.type - 页面类型：'static' 或 'dynamic'
 * @param data.dynamicParam - 动态页面参数名
 * @returns 创建结果，包含 success 和 pageId
 */
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

/**
 * 更新页面信息
 * @param pageId - 页面 ID
 * @param data - 更新数据
 * @param data.name - 页面名称
 * @param data.slug - 页面路径标识
 * @param data.modules - 页面模块数组
 * @returns 更新是否成功
 */
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

/**
 * 发布页面
 * @param pageId - 页面 ID
 * @returns 发布是否成功
 */
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

/**
 * 将页面下线
 * @param pageId - 页面 ID
 * @returns 下线是否成功
 */
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

/**
 * 删除页面
 * @param pageId - 页面 ID
 * @returns 删除是否成功
 */
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

/**
 * 获取页面配置
 * @param pageId - 页面 ID
 * @returns 页面配置对象，包含 pageId、layout、modules、config，失败时返回 null
 */
export async function getPageConfig(pageId: string): Promise<PageConfig | null> {
  try {
    const result = await request<PageConfig>(`/api/page-config?pageId=${pageId}`)
    return result.success && result.data ? result.data : null
  } catch (error) {
    console.error('Error fetching page config:', error)
    return null
  }
}

/**
 * 获取页面的模块列表
 * @param pageId - 页面 ID
 * @returns 模块数据数组，失败时返回空数组
 */
export async function getPageModules(pageId: string): Promise<ModuleData[]> {
  try {
    const pageConfig = await getPageConfig(pageId)
    return pageConfig?.modules || []
  } catch (error) {
    console.error('Error fetching page modules:', error)
    return []
  }
}

/**
 * 更新页面的模块配置
 * @param pageId - 页面 ID
 * @param modules - 模块数据数组
 * @returns 更新是否成功
 */
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

/**
 * 创建页面并返回详细响应
 * @param data - 页面创建参数
 * @param data.name - 页面名称
 * @param data.slug - 页面路径标识
 * @param data.type - 页面类型
 * @param data.dynamicParam - 动态页面参数名
 * @returns 创建结果，包含 success、pageId 和 message
 */
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

/**
 * 获取页面的使用情况
 * @param pageId - 页面 ID
 * @returns 引用该页面的页面 ID 列表
 */
export async function getPageUsage(pageId: string): Promise<string[]> {
  try {
    const result = await request<{ usedBy: string[] }>(`/api/admin/pages/${pageId}/usage`)
    return result.success && result.data ? result.data.usedBy : []
  } catch (error) {
    console.error('Error fetching page usage:', error)
    return []
  }
}

/**
 * 更新页面模块（带消息返回）
 * @param pageId - 页面 ID
 * @param modules - 模块数据数组
 * @returns 更新结果，包含 success 和 message
 */
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

/**
 * 发布页面（带消息返回）
 * @param pageId - 页面 ID
 * @returns 发布结果，包含 success 和 message
 */
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

/**
 * 获取页面预览数据
 * @param pageId - 页面 ID
 * @returns 预览结果，包含 success、pageName、modules 和 message
 */
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
