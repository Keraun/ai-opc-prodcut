import { NextRequest } from 'next/server'
import { initializeAndSyncModules } from '@/lib/initialize-modules'
import { getAllModules } from '@/modules/registry'
import { 
  successResponse, 
  errorResponse, 
  wrapApiHandler 
} from '@/lib/api-utils'
import type { ModuleRegistration } from '@/modules/types'

initializeAndSyncModules()

interface ModuleInfo {
  moduleId: string
  moduleName: string
  category?: string
  schema?: Record<string, unknown>
  defaultData?: Record<string, unknown>
}

export async function GET() {
  return wrapApiHandler(async () => {
    const registeredModules = getAllModules()
    
    const modules: ModuleInfo[] = registeredModules.map((mod: ModuleRegistration) => {
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

    return successResponse(modules)
  })
}
