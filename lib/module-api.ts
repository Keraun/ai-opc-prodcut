import type { ModuleData, ModuleRegistration } from '@/modules/types'

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

interface PageConfigResponse {
  pageId: string
  layout: string
  modules: ModuleData[]
  config: Record<string, unknown>
}

export async function getModuleInstanceData(
  moduleInstanceId: string
): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(`/api/modules?moduleInstanceId=${moduleInstanceId}`)
    const result: ApiResponse<Record<string, unknown>> = await response.json()
    
    if (result.success && result.data) {
      return result.data
    }
    
    return null
  } catch (error) {
    console.error('Error fetching module instance data:', error)
    return null
  }
}

export async function getModule(moduleId: string): Promise<ModuleData | null> {
  try {
    const response = await fetch(`/api/modules?moduleId=${moduleId}`)
    const result: ApiResponse<ModuleData> = await response.json()
    
    if (result.success && result.data) {
      return result.data
    }
    
    return null
  } catch (error) {
    console.error('Error fetching module:', error)
    return null
  }
}

export async function getAvailableModules(): Promise<string[]> {
  try {
    const response = await fetch('/api/modules?action=available')
    const result: ApiResponse<string[]> = await response.json()
    
    if (result.success && result.data) {
      return result.data
    }
    
    return []
  } catch (error) {
    console.error('Error fetching available modules:', error)
    return []
  }
}

export async function getModuleTemplate(moduleId: string): Promise<ModuleRegistration | null> {
  try {
    const response = await fetch(`/api/modules?action=template&moduleId=${moduleId}`)
    const result: ApiResponse<ModuleRegistration> = await response.json()
    
    if (result.success && result.data) {
      return result.data
    }
    
    return null
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
    const response = await fetch('/api/modules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ moduleInstanceId, data })
    })
    
    const result: ApiResponse<void> = await response.json()
    return result.success
  } catch (error) {
    console.error('Error updating module instance:', error)
    return false
  }
}

export async function getPageConfig(pageId: string): Promise<PageConfigResponse | null> {
  try {
    const response = await fetch(`/api/page-config?pageId=${pageId}`)
    const result: ApiResponse<PageConfigResponse> = await response.json()
    
    if (result.success && result.data) {
      return result.data
    }
    
    return null
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
    const response = await fetch('/api/page-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pageId, modules })
    })
    
    const result: ApiResponse<void> = await response.json()
    return result.success
  } catch (error) {
    console.error('Error updating page modules:', error)
    return false
  }
}
