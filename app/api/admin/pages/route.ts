import { NextRequest } from 'next/server'
import { 
  wrapAuthApiHandler,
  successResponse, 
  badRequestResponse,
  withDatabase,
  validateRequired,
  formatDateTime
} from '@/lib/api-utils'

interface PageInfo {
  id: string
  name: string
  slug: string
  moduleInstanceIds: string[]
  type?: 'static' | 'dynamic'
  dynamicParam?: string
  status?: 'draft' | 'published' | 'offline'
  createdAt: string
  updatedAt: string
  publishedAt?: string
  isSystem?: boolean
  isDeletable?: boolean
  description?: string
  route?: string
}

function getPageList(): PageInfo[] {
  return withDatabase(db => {
    const pages = db.prepare('SELECT * FROM pages').all() as any[]
    
    return pages.map(page => {
      let moduleInstanceIds: string[] = []
      try {
        moduleInstanceIds = page.module_instance_ids ? JSON.parse(page.module_instance_ids) : []
      } catch (e) {
        moduleInstanceIds = []
      }
      
      return {
        id: page.page_id,
        name: page.name,
        slug: page.slug,
        type: page.type,
        description: page.description,
        status: page.status,
        isSystem: page.is_system === 1,
        isDeletable: page.is_deletable === 1,
        route: page.route,
        dynamicParam: page.dynamic_param,
        createdAt: page.created_at,
        updatedAt: page.updated_at,
        publishedAt: page.published_at,
        moduleInstanceIds
      }
    })
  })
}

function createPage(
  name: string, 
  slug: string, 
  type: 'static' | 'dynamic' = 'static',
  dynamicParam?: string
): { success: boolean; pageId?: string; error?: string } {
  return withDatabase(db => {
    const pageId = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    
    const existingPage = db.prepare('SELECT page_id, name FROM pages WHERE page_id = ? OR slug = ?').get(pageId, slug) as any
    
    if (existingPage) {
      return { success: false, error: `页面路径 "/${slug}" 已被 "${existingPage.name}" 占用，请使用其他路径` }
    }
    
    const nameConflict = db.prepare('SELECT name FROM pages WHERE name = ?').get(name) as any
    if (nameConflict) {
      return { success: false, error: `页面名称 "${name}" 已存在，请使用其他名称` }
    }

    if (type === 'dynamic' && !dynamicParam) {
      return { success: false, error: '动态路由页面必须指定动态参数名称' }
    }

    const now = formatDateTime()
    const route = type === 'dynamic' ? `/${slug}/[${dynamicParam}]` : `/${slug}`
    
    db.prepare(`
      INSERT INTO pages (page_id, name, slug, type, description, status, is_system, is_deletable, route, dynamic_param, module_instance_ids, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      pageId,
      name,
      slug,
      type,
      `新创建的${type === 'dynamic' ? '动态' : '静态'}页面`,
      'draft',
      0,
      1,
      route,
      type === 'dynamic' ? dynamicParam : null,
      JSON.stringify([]),
      now,
      now
    )
    
    return { success: true, pageId }
  })
}

export async function GET() {
  return wrapAuthApiHandler(async () => {
    const pages = getPageList()
    return successResponse(pages)
  })
}

export async function POST(request: NextRequest) {
  return wrapAuthApiHandler(async () => {
    const body = await request.json()
    const { name, slug, type = 'static', dynamicParam } = body

    const validation = validateRequired(body, ['name', 'slug'])
    if (!validation.valid) {
      return badRequestResponse(`缺少必填字段: ${validation.missingFields.join(', ')}`)
    }

    if (type === 'dynamic' && !dynamicParam) {
      return badRequestResponse('动态路由页面必须指定动态参数名称')
    }

    const result = createPage(name, slug, type, dynamicParam)
    
    if (result.success) {
      return successResponse({ pageId: result.pageId }, '页面创建成功')
    } else {
      return badRequestResponse(result.error || '创建页面失败')
    }
  })
}
