import { NextRequest } from 'next/server'
import { initializeAndSyncModules } from '@/lib/initialize-modules'
import { getModuleTemplate } from '@/lib/module-service'
import { readConfig } from '@/lib/config-manager'
import { 
  successResponse, 
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
