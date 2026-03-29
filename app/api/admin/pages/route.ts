import { NextRequest } from 'next/server'
import { 
  wrapAuthApiHandler,
  successResponse, 
  badRequestResponse,
  validateRequired,
  formatDateTime
} from '@/lib/api-utils'
import { jsonDb } from '@/lib/json-database'

const createPageLocks = new Map<string, boolean>()

interface PageInfo {
  id: string
  dbId: number
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
  const pages = jsonDb.getAll('pages') as any[]
  
  return pages.map(page => {
    let moduleInstanceIds: string[] = []
    try {
      moduleInstanceIds = page.module_instance_ids ? JSON.parse(page.module_instance_ids) : []
    } catch (e) {
      moduleInstanceIds = []
    }
    
    const pageModules = jsonDb.find('page_modules', { page_id: page.page_id })
    
    return {
      id: page.page_id,
      dbId: page.id,
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
      moduleInstanceIds,
      modules: pageModules
    }
  })
}

function createPage(
  name: string, 
  slug: string, 
  type: 'static' | 'dynamic' = 'static',
  dynamicParam?: string
): { success: boolean; pageId?: string; error?: string } {
  const pageId = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')
  
  if (createPageLocks.get(pageId)) {
    return { success: false, error: '正在创建中，请稍候' }
  }
  
  createPageLocks.set(pageId, true)
  
  try {
    jsonDb.reloadTable('pages')
    
    const existingPage = jsonDb.findOne('pages', { page_id: pageId })
    if (existingPage) {
      return { success: false, error: `页面路径 "/${slug}" 已被 "${existingPage.name}" 占用，请使用其他路径` }
    }
    
    const existingSlug = jsonDb.findOne('pages', { slug: slug })
    if (existingSlug) {
      return { success: false, error: `页面路径 "/${slug}" 已被 "${existingSlug.name}" 占用，请使用其他路径` }
    }
    
    const nameConflict = jsonDb.findOne('pages', { name: name })
    if (nameConflict) {
      return { success: false, error: `页面名称 "${name}" 已存在，请使用其他名称` }
    }

    if (type === 'dynamic' && !dynamicParam) {
      return { success: false, error: '动态路由页面必须指定动态参数名称' }
    }

    const now = formatDateTime()
    const route = type === 'dynamic' ? `/${slug}/[${dynamicParam}]` : `/${slug}`
    
    const insertedPage = jsonDb.insert('pages', {
      page_id: pageId,
      name: name,
      slug: slug,
      type: type,
      description: `新创建的${type === 'dynamic' ? '动态' : '静态'}页面`,
      status: 'draft',
      is_system: 0,
      is_deletable: 1,
      route: route,
      dynamic_param: type === 'dynamic' ? dynamicParam : null,
      module_instance_ids: JSON.stringify([]),
      created_at: now,
      updated_at: now,
      published_at: null
    })
    
    const defaultModules = [
      { moduleId: 'site-root', moduleName: '站点容器' },
      { moduleId: 'site-header', moduleName: '站点头部' },
      { moduleId: 'site-footer', moduleName: '站点页脚' }
    ]
    
    const moduleInstanceIds: string[] = []
    const baseTimestamp = Date.now()
    
    defaultModules.forEach((module, index) => {
      const moduleRegistry = jsonDb.findOne('module_registry', { module_id: module.moduleId })
      const moduleInstanceId = `${module.moduleId}-${baseTimestamp}-${index}-${Math.random().toString(36).substr(2, 9)}`
      
      moduleInstanceIds.push(moduleInstanceId)
      
      jsonDb.insert('page_modules', {
        page_id: pageId,
        module_id: module.moduleId,
        module_instance_id: moduleInstanceId,
        module_name: module.moduleName || moduleRegistry?.module_name || module.moduleId,
        module_order: index,
        data: moduleRegistry?.default_data || '{}',
        created_at: now,
        updated_at: now
      })
    })
    
    jsonDb.update('pages', insertedPage.id, {
      module_instance_ids: JSON.stringify(moduleInstanceIds),
      updated_at: now
    })
    
    return { success: true, pageId }
  } finally {
    createPageLocks.delete(pageId)
  }
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
