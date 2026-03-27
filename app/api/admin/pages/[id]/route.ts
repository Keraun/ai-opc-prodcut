import { NextRequest } from 'next/server'
import { getDatabase } from '@/lib/database'
import { getSystemPages } from '@/lib/server/page-utils'
import type { ModuleData } from '@/modules/types'
import { 
  successResponse, 
  errorResponse, 
  badRequestResponse, 
  notFoundResponse, 
  wrapApiHandler 
} from '@/lib/api-utils'

interface PageInfo {
  id: string
  name: string
  slug: string
  moduleInstanceIds: string[]
  modules: ModuleData[]
  status?: 'draft' | 'published' | 'offline'
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
}

function getPageDetail(pageId: string): PageInfo | null {
  const db = getDatabase()
  
  try {
    const page = db.prepare('SELECT * FROM pages WHERE page_id = ?').get(pageId) as any
    
    if (!page) {
      return null
    }
    
    const pageModules = db.prepare(`
      SELECT pm.*, mr.default_data
      FROM page_modules pm
      LEFT JOIN module_registry mr ON pm.module_id = mr.module_id
      WHERE pm.page_id = ?
      ORDER BY pm.module_order
    `).all(pageId) as any[]
    
    const modules: ModuleData[] = pageModules.map((pm: any) => {
      const moduleData = pm.data 
        ? JSON.parse(pm.data) 
        : (pm.default_data ? JSON.parse(pm.default_data) : {})
      
      return {
        moduleName: pm.module_name,
        moduleId: pm.module_id,
        moduleInstanceId: pm.module_instance_id,
        data: moduleData
      }
    })
    
    let moduleInstanceIds: string[] = []
    try {
      moduleInstanceIds = page.module_instance_ids ? JSON.parse(page.module_instance_ids) : []
    } catch (e) {
      moduleInstanceIds = []
    }

    return {
      id: pageId,
      name: page.name,
      slug: page.slug,
      moduleInstanceIds,
      modules,
      status: page.status as 'draft' | 'published' | 'offline',
      createdAt: page.created_at,
      updatedAt: page.updated_at,
      publishedAt: page.published_at,
    }
  } finally {
    db.close()
  }
}

function updatePage(pageId: string, updates: { name?: string; slug?: string; modules?: ModuleData[] }): boolean {
  const db = getDatabase()
  
  try {
    db.exec('BEGIN TRANSACTION')
    
    const existingPage = db.prepare('SELECT * FROM pages WHERE page_id = ?').get(pageId) as any
    
    if (!existingPage) {
      return false
    }

    if (updates.modules) {
      const existingModules = db.prepare('SELECT module_instance_id FROM page_modules WHERE page_id = ?').all(pageId) as any[]
      for (const existing of existingModules) {
        db.prepare('DELETE FROM page_modules WHERE module_instance_id = ?').run(existing.module_instance_id)
      }
      
      const moduleInstanceIds: string[] = []
      const stmt = db.prepare(`
        INSERT INTO page_modules (module_instance_id, page_id, module_id, module_name, module_order, data)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      
      updates.modules.forEach((module, index) => {
        const moduleInstanceId = module.moduleInstanceId || 
          `${module.moduleId}-${Date.now()}`
        
        moduleInstanceIds.push(moduleInstanceId)
        
        stmt.run(
          moduleInstanceId,
          pageId,
          module.moduleId,
          module.moduleName || module.moduleId,
          index,
          module.data ? JSON.stringify(module.data) : null
        )
      })
      
      db.prepare(`
        UPDATE pages 
        SET name = ?, slug = ?, module_instance_ids = ?, updated_at = ?
        WHERE page_id = ?
      `).run(
        updates.name || existingPage.name,
        updates.slug || existingPage.slug,
        JSON.stringify(moduleInstanceIds),
        new Date().toISOString(),
        pageId
      )
    } else {
      db.prepare(`
        UPDATE pages 
        SET name = ?, slug = ?, updated_at = ?
        WHERE page_id = ?
      `).run(
        updates.name || existingPage.name,
        updates.slug || existingPage.slug,
        new Date().toISOString(),
        pageId
      )
    }

    db.exec('COMMIT')
    return true
  } catch (error) {
    db.exec('ROLLBACK')
    console.error('Error updating page:', error)
    return false
  } finally {
    db.close()
  }
}

function deletePage(pageId: string): boolean {
  const db = getDatabase()
  
  try {
    db.exec('BEGIN TRANSACTION')
    
    db.prepare('DELETE FROM page_modules WHERE page_id = ?').run(pageId)
    
    const result = db.prepare('DELETE FROM pages WHERE page_id = ?').run(pageId)
    
    db.exec('COMMIT')
    
    return result.changes > 0
  } catch (error) {
    db.exec('ROLLBACK')
    console.error('Error deleting page:', error)
    return false
  } finally {
    db.close()
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return wrapApiHandler(async () => {
    const pageId = params.id
    const page = getPageDetail(pageId)

    if (!page) {
      return notFoundResponse('页面不存在')
    }

    return successResponse(page)
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return wrapApiHandler(async () => {
    const pageId = params.id
    const body = await request.json()
    const { name, slug, modules } = body

    const success = updatePage(pageId, { name, slug, modules })

    if (success) {
      return successResponse(undefined, '页面更新成功')
    } else {
      return errorResponse('页面更新失败', 500)
    }
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return wrapApiHandler(async () => {
    const pageId = params.id
    const systemPages = getSystemPages()
    
    if (systemPages.includes(pageId)) {
      return badRequestResponse('系统页面不能删除')
    }

    const success = deletePage(pageId)

    if (success) {
      return successResponse(undefined, '页面删除成功')
    } else {
      return errorResponse('页面删除失败', 500)
    }
  })
}
