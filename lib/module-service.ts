import "server-only"
import { jsonDb } from './json-database'
import { clearInitialDataCache } from './initial-data'
import { getModule, getAllModules } from '@/modules/registry'
import type { ModuleRegistration, ModuleData } from '@/modules/types'

const isDev = process.env.NODE_ENV === 'development'

export function getModuleTemplate(moduleId: string): ModuleRegistration | null {
  // 无论在开发环境还是生产环境，都重新加载数据，确保获取到最新的数据
  jsonDb.reload()
  
  try {
    const module = getModule(moduleId)
    if (module) {
      return module
    }
    
    const dbModule = jsonDb.findOne('module_registry', { module_id: moduleId })
    if (dbModule) {
      return {
        moduleId: dbModule.module_id,
        moduleName: dbModule.module_name,
        schema: dbModule.schema ? JSON.parse(dbModule.schema) : undefined,
        defaultData: dbModule.default_data ? JSON.parse(dbModule.default_data) : undefined,
        component: null as any
      }
    }
    
    return null
  } catch (error) {
    console.error('Error getting module template:', error)
    return null
  }
}

export interface PageConfig {
  pageId: string
  pageName: string
  layout?: string
  modules: ModuleData[]
  moduleInstanceIds: string[]
  config?: any
}

export function getPageConfig(pageId: string): PageConfig | null {
  // 无论在开发环境还是生产环境，都重新加载数据，确保获取到最新的数据
  jsonDb.reload()
  
  try {
    const page = jsonDb.findOne('pages', { page_id: pageId })
    
    if (!page) {
      return null
    }
    
    let moduleInstanceIds: string[] = []
    try {
      moduleInstanceIds = page.module_instance_ids ? JSON.parse(page.module_instance_ids) : []
    } catch (e) {
      moduleInstanceIds = []
    }
    
    const pageModules = jsonDb.find('page_modules', { page_id: pageId })
      .sort((a: any, b: any) => a.module_order - b.module_order)
    
    const modules: ModuleData[] = pageModules.map((pm: any) => {
      const module = jsonDb.findOne('module_registry', { module_id: pm.module_id })
      const moduleData = pm.data 
        ? JSON.parse(pm.data) 
        : (module?.default_data ? JSON.parse(module.default_data) : {})
      
      return {
        moduleId: pm.module_id,
        moduleInstanceId: pm.module_instance_id,
        moduleName: pm.module_name,
        data: moduleData
      }
    })
    
    return {
      pageId: page.page_id,
      pageName: page.name || pageId,
      layout: page.layout || 'default',
      modules,
      moduleInstanceIds,
      config: page
    }
  } catch (error) {
    console.error('Error getting page config:', error)
    return null
  }
}

export function getPageModules(pageId: string): ModuleData[] {
  const config = getPageConfig(pageId)
  return config?.modules || []
}

export function updatePageModules(pageId: string, modules: ModuleData[]): boolean {
  try {
    for (const module of modules) {
      if (module.moduleInstanceId) {
        const existing = jsonDb.findOne('page_modules', { 
          module_instance_id: module.moduleInstanceId 
        })
        
        if (existing) {
          jsonDb.update('page_modules', existing.id, {
            data: module.data ? JSON.stringify(module.data) : null,
            updated_at: new Date().toISOString()
          })
        }
      }
    }
    
    clearInitialDataCache()
    return true
  } catch (error) {
    console.error('Error updating page modules:', error)
    return false
  }
}

export function getAvailableModules(): Array<{
  moduleId: string
  moduleName: string
  category?: string
  schema?: Record<string, unknown>
  defaultData?: Record<string, unknown>
}> {
  // 无论在开发环境还是生产环境，都重新加载数据，确保获取到最新的数据
  jsonDb.reload()
  
  try {
    const registeredModules = getAllModules()
    
    return registeredModules.map((mod: ModuleRegistration) => {
      let category = '其他'
      
      if (mod.moduleId.startsWith('section-')) {
        category = '页面区块'
      } else if (mod.moduleId.startsWith('site-')) {
        category = '站点组件'
      } else if (mod.moduleId.includes('list') || mod.moduleId.includes('detail')) {
        category = '列表/详情'
      }
      
      return {
        moduleId: mod.moduleId,
        moduleName: mod.moduleName,
        category,
        schema: mod.schema,
        defaultData: mod.defaultData,
      }
    })
  } catch (error) {
    console.error('Error getting available modules:', error)
    return []
  }
}
