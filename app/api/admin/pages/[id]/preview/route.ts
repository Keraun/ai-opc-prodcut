import { NextRequest } from 'next/server'
import { initializeModules } from '@/modules/init'
import { getModuleComponent, getModuleDefaultData } from '@/modules/registry'
import { readConfig } from '@/lib/config-manager'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-utils'

initializeModules()

interface ModuleInfo {
  moduleId: string
  moduleName: string
  moduleInstanceId: string
  data: Record<string, unknown>
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pageId } = await params
    const body = await request.json()
    const { modules } = body as { modules: ModuleInfo[] }

    const pageConfig = readConfig(`page-${pageId}`)
    if (!pageConfig) {
      return notFoundResponse('页面不存在')
    }

    const moduleDataArray: Array<{
      moduleId: string
      moduleName: string
      moduleInstanceId: string
      data: Record<string, unknown>
      hasComponent: boolean
    }> = []

    for (const moduleInfo of modules) {
      const ModuleComponent = getModuleComponent(moduleInfo.moduleId)
      
      if (ModuleComponent) {
        const defaultData = getModuleDefaultData(moduleInfo.moduleId) || {}
        const moduleData = { ...defaultData, ...moduleInfo.data }
        
        moduleDataArray.push({
          ...moduleInfo,
          data: moduleData,
          hasComponent: true,
        })
      } else {
        moduleDataArray.push({
          ...moduleInfo,
          hasComponent: false,
        })
      }
    }

    return successResponse({
      pageName: pageConfig.name || pageId,
      modules: moduleDataArray,
    })
  } catch (error) {
    console.error('Generate preview error:', error)
    return errorResponse('生成预览失败')
  }
}
