import { NextRequest, NextResponse } from 'next/server'
import { initializeModules } from '@/modules/init'
import { getAllModules } from '@/modules/registry'
import { getModuleRegistryList, registerModule } from '@/lib/module-service'
import type { ModuleRegistration } from '@/modules/types'

initializeModules()

interface ModuleInfo {
  moduleId: string
  moduleName: string
  category?: string
  schema?: Record<string, unknown>
  defaultData?: Record<string, unknown>
}

export async function GET() {
  try {
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

    for (const mod of registeredModules) {
      registerModule(
        mod.moduleId,
        mod.moduleName,
        mod.schema,
        mod.defaultData
      )
    }

    return NextResponse.json({
      success: true,
      modules,
    })
  } catch (error) {
    console.error('Get modules error:', error)
    return NextResponse.json({
      success: false,
      message: '获取模块列表失败',
    }, { status: 500 })
  }
}
