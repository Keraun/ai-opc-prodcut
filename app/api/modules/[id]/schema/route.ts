import { NextRequest, NextResponse } from 'next/server'
import { initializeAndSyncModules } from '@/lib/initialize-modules'
import { getModule, getModuleSchema } from '@/modules/registry'
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
    const schema = getModuleSchema(moduleId)

    if (!moduleTemplate || !schema) {
      return notFoundResponse('模块schema不存在')
    }

    return successResponse(schema)
  })
}
