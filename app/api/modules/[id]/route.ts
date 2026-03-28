import { NextRequest, NextResponse } from 'next/server'
import { initializeAndSyncModules } from '@/lib/initialize-modules'
import { getModule, getModuleDefaultData, getModuleSchema } from '@/modules/registry'
import { readConfig } from '@/lib/config-manager'
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  wrapApiHandler 
} from '@/lib/api-utils'

initializeAndSyncModules()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return wrapApiHandler(async () => {
    const { id: moduleId } = await params
    const moduleTemplate = getModule(moduleId)
    const currentData = readConfig(moduleId)

    if (!moduleTemplate) {
      return notFoundResponse('模块不存在')
    }

    return successResponse({
      moduleId,
      schema: getModuleSchema(moduleId),
      defaultData: getModuleDefaultData(moduleId),
      currentData,
    })
  })
}
