import { NextRequest } from 'next/server'
import { initializeAndSyncModules } from '@/lib/initialize-modules'
import { getModuleComponent, getModuleDefaultData } from '@/modules/registry'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-utils'

initializeAndSyncModules()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: moduleId } = await params
    
    const ModuleComponent = getModuleComponent(moduleId)
    
    if (!ModuleComponent) {
      return notFoundResponse('模块不存在')
    }

    const defaultData = getModuleDefaultData(moduleId) || {}
    
    return successResponse({
      moduleId,
      moduleName: moduleId,
      defaultData,
    })
  } catch (error) {
    console.error('Module preview error:', error)
    return errorResponse('获取模块信息失败')
  }
}
