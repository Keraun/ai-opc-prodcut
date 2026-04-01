import { NextRequest } from 'next/server'
import { getPageConfig, getPageModules } from '@/lib/module-service'
import { 
  successResponse, 
  errorResponse, 
  badRequestResponse, 
  notFoundResponse, 
  wrapApiHandler 
} from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  return wrapApiHandler(async () => {
    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('pageId')

    if (!pageId) {
      return badRequestResponse('pageId 参数必填')
    }

    const pageConfig = getPageConfig(pageId)
    
    if (!pageConfig) {
      return notFoundResponse(`页面 ${pageId} 不存在`)
    }

    const modules = getPageModules(pageId)

    return successResponse({
      pageId,
      layout: pageConfig.layout || 'default',
      modules,
      moduleInstanceIds: pageConfig.moduleInstanceIds,
      config: pageConfig
    })
  })
}
