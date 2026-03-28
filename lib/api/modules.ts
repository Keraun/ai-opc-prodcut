import type { ModuleInfo, ModuleData, ModuleRegistration } from './types'
import { request } from './request'

/**
 * 获取所有可用模块列表
 * @returns 模块信息数组，失败时返回空数组
 */
export async function getAvailableModules(): Promise<ModuleInfo[]> {
  try {
    const result = await request<ModuleInfo[]>('/api/modules')
    return result.success && result.data ? result.data : []
  } catch (error) {
    console.error('Error fetching available modules:', error)
    return []
  }
}

/**
 * 获取所有可用模块的 ID 列表
 * @returns 模块 ID 字符串数组，失败时返回空数组
 */
export async function getAvailableModuleIds(): Promise<string[]> {
  try {
    const result = await request<string[]>('/api/modules?action=available')
    return result.success && result.data ? result.data : []
  } catch (error) {
    console.error('Error fetching available module ids:', error)
    return []
  }
}

/**
 * 获取指定模块的 Schema 配置
 * @param moduleId - 模块 ID
 * @returns 模块 Schema 对象，失败时返回 null
 */
export async function getModuleSchema(moduleId: string): Promise<Record<string, unknown> | null> {
  try {
    const result = await request<Record<string, unknown>>(`/api/modules/${moduleId}/schema`)
    return result.success && result.data ? result.data : null
  } catch (error) {
    console.error('Error fetching module schema:', error)
    return null
  }
}

/**
 * 获取模块的完整信息，包括 Schema、默认数据和当前数据
 * @param moduleId - 模块 ID
 * @returns 包含 schema、defaultData、currentData 的对象，失败时返回 null
 */
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

/**
 * 获取模块实例的数据
 * @param moduleInstanceId - 模块实例 ID
 * @returns 模块实例数据对象，失败时返回 null
 */
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

/**
 * 根据模块 ID 获取模块数据
 * @param moduleId - 模块 ID
 * @returns 模块数据对象，失败时返回 null
 */
export async function getModule(moduleId: string): Promise<ModuleData | null> {
  try {
    const result = await request<ModuleData>(`/api/modules?moduleId=${moduleId}`)
    return result.success && result.data ? result.data : null
  } catch (error) {
    console.error('Error fetching module:', error)
    return null
  }
}

/**
 * 获取模块模板信息
 * @param moduleId - 模块 ID
 * @returns 模块注册信息对象，失败时返回 null
 */
export async function getModuleTemplate(moduleId: string): Promise<ModuleRegistration | null> {
  try {
    const result = await request<ModuleRegistration>(`/api/modules?action=template&moduleId=${moduleId}`)
    return result.success && result.data ? result.data : null
  } catch (error) {
    console.error('Error fetching module template:', error)
    return null
  }
}

/**
 * 更新模块实例数据
 * @param moduleInstanceId - 模块实例 ID
 * @param data - 要更新的数据
 * @returns 更新是否成功
 */
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

/**
 * 获取模块预览信息
 * @param moduleId - 模块 ID
 * @returns 包含 moduleId、moduleName、defaultData 的预览信息
 */
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
