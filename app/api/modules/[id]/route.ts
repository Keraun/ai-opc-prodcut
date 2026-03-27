import { NextRequest, NextResponse } from 'next/server'
import { initializeAndSyncModules } from '@/lib/initialize-modules'
import { getModuleTemplate } from '@/lib/module-service'
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
  { params }: { params: { id: string } }
) {
  return wrapApiHandler(async () => {
    const moduleId = params.id
    const moduleTemplate = getModuleTemplate(moduleId)
    const currentData = readConfig(moduleId)

    if (!moduleTemplate) {
      return notFoundResponse('模块不存在')
    }

    return successResponse({
      moduleId,
      schema: moduleTemplate.schema,
      defaultData: moduleTemplate.defaultData,
      currentData,
    })
  })
}
