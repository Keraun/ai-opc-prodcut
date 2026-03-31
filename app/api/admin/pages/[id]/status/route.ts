import { NextRequest } from 'next/server'
import { 
  wrapAuthApiHandler,
  successResponse, 
  badRequestResponse, 
  notFoundResponse,
  formatDateTime
} from '@/lib/api-utils'
import { jsonDb } from '@/lib/json-database'
import fs from 'fs'
import path from 'path'

function syncPageListJson() {
  try {
    jsonDb.reloadTable('pages')
    const pages = jsonDb.getAll('pages') as any[]
    
    const pageListData = {
      pages: pages.map(page => ({
        id: page.page_id,
        name: page.name,
        slug: page.slug,
        type: page.type,
        status: page.status,
        isSystem: page.is_system === 1,
        isDeletable: page.is_deletable === 1,
        route: page.route,
        dynamicParam: page.dynamic_param,
        createdAt: page.created_at,
        updatedAt: page.updated_at,
        publishedAt: page.published_at,
        modules: []
      })),
      systemPages: ['home', '404'],
      dynamicRoutePattern: '[param]',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const pageListPath = path.join(process.cwd(), 'database', 'runtime', 'page_list.json')
    fs.writeFileSync(pageListPath, JSON.stringify(pageListData, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error syncing page_list.json:', error)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return wrapAuthApiHandler(async () => {
    const { id: pageId } = await params
    const body = await request.json()
    const { action } = body

    if (!['publish', 'offline'].includes(action)) {
      return badRequestResponse('无效的操作')
    }

    jsonDb.reloadTable('pages')
    
    const page = jsonDb.findOne('pages', { page_id: pageId })
    
    if (!page) {
      return notFoundResponse('页面不存在')
    }

    const now = formatDateTime()
    const newStatus = action === 'publish' ? 'published' : 'offline'
    
    const updateData: any = {
      status: newStatus,
      updated_at: now,
    }
    
    if (action === 'publish') {
      updateData.published_at = now
    }

    jsonDb.update('pages', page.id, updateData)
    
    syncPageListJson()

    return successResponse({ status: newStatus }, action === 'publish' ? '页面发布成功' : '页面已下线')
  })
}
