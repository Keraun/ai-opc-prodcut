import type { ModuleInfo, ModuleData, ModuleRegistration } from './types'
import { request } from './request'

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
