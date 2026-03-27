import { NextRequest, NextResponse } from 'next/server'
import { initializeAndSyncModules } from '@/lib/initialize-modules'
import { getModuleTemplate } from '@/lib/module-service'
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

    if (!moduleTemplate || !moduleTemplate.schema) {
      return notFoundResponse('模块schema不存在')
    }

    return successResponse(moduleTemplate.schema)
  })
}
