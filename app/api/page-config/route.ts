import { NextRequest } from 'next/server'
import { getPageConfig, getPageModules, updatePageModules } from '@/lib/module-service'
import type { ModuleData } from '@/modules/types'
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

export async function POST(request: NextRequest) {
  return wrapApiHandler(async () => {
    const body = await request.json()
    const { pageId, modules } = body

    if (!pageId) {
      return badRequestResponse('pageId 参数必填')
    }

    if (!modules || !Array.isArray(modules)) {
      return badRequestResponse('modules 参数必须是一个数组')
    }

    const success = updatePageModules(pageId, modules as ModuleData[])

    if (success) {
      return successResponse(undefined, '页面模块更新成功')
    } else {
      return errorResponse('页面模块更新失败', 500)
    }
  })
}
