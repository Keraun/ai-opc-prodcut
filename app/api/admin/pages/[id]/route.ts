import { NextRequest } from 'next/server'
import { 
  wrapAuthApiHandler,
  successResponse, 
  notFoundResponse,
  formatDateTime
} from '@/lib/api-utils'
import { jsonDb } from '@/lib/json-database'
import { clearInitialDataCache } from '@/lib/initial-data'
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

interface ModuleInfo {
  moduleId: string
  moduleName: string
  moduleInstanceId: string
  data: Record<string, unknown>
}

interface PageInfo {
  id: string
  name: string
  slug: string
  type?: 'static' | 'dynamic'
  dynamicParam?: string
  status?: 'draft' | 'published' | 'offline'
  description?: string
  isSystem?: boolean
  isDeletable?: boolean
  route?: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
  moduleInstanceIds: string[]
  modules: ModuleInfo[]
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return wrapAuthApiHandler(async () => {
    const { id: pageId } = await params
    
    jsonDb.reloadTable('pages')
    jsonDb.reloadTable('page_modules')
    jsonDb.reloadTable('module_registry')
    
    const page = jsonDb.findOne('pages', { page_id: pageId })
    
    if (!page) {
      return notFoundResponse('页面不存在')
    }
    
    let moduleInstanceIds: string[] = []
    try {
      moduleInstanceIds = page.module_instance_ids ? JSON.parse(page.module_instance_ids) : []
    } catch (e) {
      moduleInstanceIds = []
    }
    
    const pageModules = jsonDb.find('page_modules', { page_id: pageId })
      .sort((a: any, b: any) => a.module_order - b.module_order)
    
    const modules: ModuleInfo[] = pageModules.map((pm: any) => {
      const module = jsonDb.findOne('module_registry', { module_id: pm.module_id })
      
      let moduleData = {}
      
      if (pm.module_id === 'site-root') {
        const siteConfig = jsonDb.findOne('system_config', { config_key: 'site_config' })
        moduleData = siteConfig ? JSON.parse(siteConfig.config_value) : {}
      } else if (pm.module_id === 'site-footer') {
        const footerConfig = jsonDb.findOne('system_config', { config_key: 'site_footer_config' })
        moduleData = footerConfig ? JSON.parse(footerConfig.config_value) : {}
      } else {
        moduleData = pm.data 
          ? JSON.parse(pm.data) 
          : (module?.default_data ? JSON.parse(module.default_data) : {})
      }
      
      return {
        moduleId: pm.module_id,
        moduleName: pm.module_name || module?.module_name || pm.module_id,
        moduleInstanceId: pm.module_instance_id,
        data: moduleData
      }
    })
    
    const pageInfo: PageInfo = {
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
      moduleInstanceIds,
      modules
    }
    
    return successResponse(pageInfo)
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return wrapAuthApiHandler(async () => {
    const { id: pageId } = await params
    const body = await request.json()
    const { name, slug, modules } = body
    
    jsonDb.reloadTable('pages')
    jsonDb.reloadTable('page_modules')
    
    const page = jsonDb.findOne('pages', { page_id: pageId })
    
    if (!page) {
      return notFoundResponse('页面不存在')
    }
    
    const now = formatDateTime()
    
    if (name || slug) {
      const updateData: any = {
        updated_at: now
      }
      
      if (name) updateData.name = name
      if (slug) updateData.slug = slug
      
      jsonDb.update('pages', page.id, updateData)
    }
    
    if (modules && Array.isArray(modules)) {
      const existingModules = jsonDb.find('page_modules', { page_id: pageId })
      existingModules.forEach((pm: any) => {
        jsonDb.delete('page_modules', { module_instance_id: pm.module_instance_id })
      })
      
      modules.forEach((module: ModuleInfo, index: number) => {
        const moduleRegistry = jsonDb.findOne('module_registry', { module_id: module.moduleId })
        
        const isGlobalModule = module.moduleId === 'site-root' || module.moduleId === 'site-footer'
        
        jsonDb.insert('page_modules', {
          page_id: pageId,
          module_id: module.moduleId,
          module_instance_id: module.moduleInstanceId,
          module_name: module.moduleName || moduleRegistry?.module_name || module.moduleId,
          module_order: index,
          data: isGlobalModule ? null : JSON.stringify(module.data),
          created_at: now,
          updated_at: now
        })
      })
      
      const moduleInstanceIds = modules.map(m => m.moduleInstanceId)
      jsonDb.update('pages', page.id, {
        module_instance_ids: JSON.stringify(moduleInstanceIds),
        updated_at: now
      })
    }
    
    syncPageListJson()
    clearInitialDataCache()
    return successResponse(null, '页面更新成功')
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return wrapAuthApiHandler(async () => {
    const { id: pageId } = await params
    
    jsonDb.reloadTable('pages')
    jsonDb.reloadTable('page_modules')
    
    const page = jsonDb.findOne('pages', { page_id: pageId })
    
    if (!page) {
      return notFoundResponse('页面不存在')
    }
    
    if (page.is_system === 1) {
      return successResponse(null, '系统页面不能删除')
    }
    
    const pageModules = jsonDb.find('page_modules', { page_id: pageId })
    for (const pm of pageModules) {
      jsonDb.delete('page_modules', { module_instance_id: pm.module_instance_id })
    }
    
    jsonDb.delete('pages', { page_id: pageId })
    
    syncPageListJson()
    clearInitialDataCache()
    return successResponse(null, '页面删除成功')
  })
}
