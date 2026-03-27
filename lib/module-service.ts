import "server-only"
import type { ModuleData, ModuleRegistration } from '@/modules/types'
import { getDatabase } from './database'

export function getPageModules(pageId: string): ModuleData[] {
  const db = getDatabase()
  
  try {
    const pageModules = db.prepare(`
      SELECT pm.*, mr.default_data
      FROM page_modules pm
      LEFT JOIN module_registry mr ON pm.module_id = mr.module_id
      WHERE pm.page_id = ?
      ORDER BY pm.module_order
    `).all(pageId) as any[]
    
    return pageModules.map((pm: any) => {
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
  } finally {
    db.close()
  }
}

export function getModuleInstanceData(moduleInstanceId: string): Record<string, unknown> | null {
  const db = getDatabase()
  
  try {
    const moduleInstance = db.prepare(`
      SELECT pm.*, mr.default_data
      FROM page_modules pm
      LEFT JOIN module_registry mr ON pm.module_id = mr.module_id
      WHERE pm.module_instance_id = ?
    `).get(moduleInstanceId) as any
    
    if (moduleInstance) {
      if (moduleInstance.data) {
        return JSON.parse(moduleInstance.data)
      }
      if (moduleInstance.default_data) {
        return JSON.parse(moduleInstance.default_data)
      }
    }
    
    return null
  } finally {
    db.close()
  }
}

export function getModuleData(moduleId: string): ModuleData | null {
  const db = getDatabase()
  
  try {
    const module = db.prepare(`
      SELECT * FROM module_registry WHERE module_id = ?
    `).get(moduleId) as any
    
    if (!module) {
      return null
    }
    
    const data = JSON.parse(module.default_data)
    
    return {
      moduleName: module.module_name,
      moduleId: module.module_id,
      moduleInstanceId: `${moduleId}-${Date.now()}`,
      data
    }
  } finally {
    db.close()
  }
}

export function updateModuleInstanceData(
  moduleInstanceId: string, 
  data: Record<string, unknown>
): boolean {
  const db = getDatabase()
  
  try {
    const result = db.prepare(`
      UPDATE page_modules 
      SET data = ?, updated_at = CURRENT_TIMESTAMP
      WHERE module_instance_id = ?
    `).run(JSON.stringify(data), moduleInstanceId)
    
    return result.changes > 0
  } finally {
    db.close()
  }
}

export function updatePageModules(pageId: string, modules: ModuleData[]): boolean {
  const db = getDatabase()
  
  try {
    db.exec('BEGIN TRANSACTION')
    
    const existingModules = db.prepare('SELECT module_instance_id FROM page_modules WHERE page_id = ?').all(pageId) as any[]
    for (const existing of existingModules) {
      db.prepare('DELETE FROM page_modules WHERE module_instance_id = ?').run(existing.module_instance_id)
    }
    
    const moduleInstanceIds: string[] = []
    const stmt = db.prepare(`
      INSERT INTO page_modules (module_instance_id, page_id, module_id, module_name, module_order, data)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    
    modules.forEach((module, index) => {
      const moduleInstanceId = module.moduleInstanceId || 
        `${module.moduleId}-${Date.now()}-${index}`
      
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
      SET module_instance_ids = ?, updated_at = CURRENT_TIMESTAMP
      WHERE page_id = ?
    `).run(JSON.stringify(moduleInstanceIds), pageId)
    
    db.exec('COMMIT')
    return true
  } catch (error) {
    db.exec('ROLLBACK')
    console.error('Error updating page modules:', error)
    return false
  } finally {
    db.close()
  }
}

export function getModuleTemplate(moduleId: string): ModuleRegistration | null {
  const db = getDatabase()
  
  try {
    const module = db.prepare(`
      SELECT * FROM module_registry WHERE module_id = ?
    `).get(moduleId) as any
    
    if (module) {
      const data = module.default_data ? JSON.parse(module.default_data) : {}
      return {
        moduleName: module.module_name,
        moduleId: module.module_id,
        component: null as any,
        schema: module.schema ? JSON.parse(module.schema) : {},
        defaultData: data
      }
    }
    
    return null
  } finally {
    db.close()
  }
}

export function getAllAvailableModules(): string[] {
  const db = getDatabase()
  
  try {
    const modules = db.prepare(`
      SELECT module_id FROM module_registry
    `).all() as any[]
    
    return modules.map((m: any) => m.module_id)
  } finally {
    db.close()
  }
}

export function getModuleRegistryList(): any[] {
  const db = getDatabase()
  
  try {
    const modules = db.prepare(`
      SELECT * FROM module_registry
    `).all() as any[]
    
    return modules.map(m => ({
      moduleId: m.module_id,
      moduleName: m.module_name,
      schema: m.schema ? JSON.parse(m.schema) : null,
      defaultData: m.default_data ? JSON.parse(m.default_data) : null
    }))
  } finally {
    db.close()
  }
}

export function createModuleInstance(
  pageId: string,
  moduleId: string,
  order: number,
  data?: Record<string, unknown>
): string {
  const db = getDatabase()
  
  try {
    const moduleInstanceId = `${moduleId}-${Date.now()}`
    
    const moduleRegistry = db.prepare('SELECT module_name FROM module_registry WHERE module_id = ?').get(moduleId) as any
    const moduleName = moduleRegistry?.module_name || moduleId
    
    db.prepare(`
      INSERT INTO page_modules (module_instance_id, page_id, module_id, module_name, module_order, data)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      moduleInstanceId,
      pageId,
      moduleId,
      moduleName,
      order,
      data ? JSON.stringify(data) : null
    )
    
    const page = db.prepare('SELECT module_instance_ids FROM pages WHERE page_id = ?').get(pageId) as any
    let moduleInstanceIds: string[] = []
    if (page?.module_instance_ids) {
      try {
        moduleInstanceIds = JSON.parse(page.module_instance_ids)
      } catch (e) {
        moduleInstanceIds = []
      }
    }
    moduleInstanceIds.push(moduleInstanceId)
    
    db.prepare(`
      UPDATE pages SET module_instance_ids = ?, updated_at = CURRENT_TIMESTAMP WHERE page_id = ?
    `).run(JSON.stringify(moduleInstanceIds), pageId)
    
    return moduleInstanceId
  } finally {
    db.close()
  }
}

export function deleteModuleInstance(pageId: string, moduleInstanceId: string): boolean {
  const db = getDatabase()
  
  try {
    db.exec('BEGIN TRANSACTION')
    
    const result = db.prepare(`
      DELETE FROM page_modules WHERE module_instance_id = ? AND page_id = ?
    `).run(moduleInstanceId, pageId)
    
    if (result.changes > 0) {
      const page = db.prepare('SELECT module_instance_ids FROM pages WHERE page_id = ?').get(pageId) as any
      if (page?.module_instance_ids) {
        let moduleInstanceIds: string[] = []
        try {
          moduleInstanceIds = JSON.parse(page.module_instance_ids)
        } catch (e) {
          moduleInstanceIds = []
        }
        moduleInstanceIds = moduleInstanceIds.filter(id => id !== moduleInstanceId)
        
        db.prepare(`
          UPDATE pages SET module_instance_ids = ?, updated_at = CURRENT_TIMESTAMP WHERE page_id = ?
        `).run(JSON.stringify(moduleInstanceIds), pageId)
      }
    }
    
    db.exec('COMMIT')
    return result.changes > 0
  } catch (error) {
    db.exec('ROLLBACK')
    console.error('Error deleting module instance:', error)
    return false
  } finally {
    db.close()
  }
}

export function reorderPageModules(pageId: string, moduleInstanceIds: string[]): boolean {
  const db = getDatabase()
  
  try {
    db.exec('BEGIN TRANSACTION')
    
    const stmt = db.prepare(`
      UPDATE page_modules 
      SET module_order = ?, updated_at = CURRENT_TIMESTAMP
      WHERE page_id = ? AND module_instance_id = ?
    `)
    
    moduleInstanceIds.forEach((instanceId, index) => {
      stmt.run(index, pageId, instanceId)
    })
    
    db.prepare(`
      UPDATE pages SET module_instance_ids = ?, updated_at = CURRENT_TIMESTAMP WHERE page_id = ?
    `).run(JSON.stringify(moduleInstanceIds), pageId)
    
    db.exec('COMMIT')
    return true
  } catch (error) {
    db.exec('ROLLBACK')
    console.error('Error reordering page modules:', error)
    return false
  } finally {
    db.close()
  }
}

export function registerModule(
  moduleId: string,
  moduleName: string,
  schema: Record<string, unknown> | null,
  defaultData: Record<string, unknown>
): boolean {
  const db = getDatabase()
  
  try {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO module_registry (module_id, module_name, schema, default_data)
      VALUES (?, ?, ?, ?)
    `)
    stmt.run(
      moduleId,
      moduleName,
      schema ? JSON.stringify(schema) : null,
      JSON.stringify(defaultData)
    )
    return true
  } catch (error) {
    console.error('Error registering module:', error)
    return false
  } finally {
    db.close()
  }
}

export function unregisterModule(moduleId: string): boolean {
  const db = getDatabase()
  
  try {
    const result = db.prepare('DELETE FROM module_registry WHERE module_id = ?').run(moduleId)
    return result.changes > 0
  } finally {
    db.close()
  }
}

export function getPageConfig(pageId: string): any {
  const db = getDatabase()
  
  try {
    const page = db.prepare('SELECT * FROM pages WHERE page_id = ?').get(pageId) as any
    
    if (!page) {
      return null
    }
    
    return {
      pageId: page.page_id,
      name: page.name,
      slug: page.slug,
      type: page.type,
      description: page.description,
      status: page.status,
      isSystem: page.is_system === 1,
      isDeletable: page.is_deletable === 1,
      route: page.route,
      dynamicParam: page.dynamic_param,
      moduleInstanceIds: JSON.parse(page.module_instance_ids || '[]'),
      createdAt: page.created_at,
      updatedAt: page.updated_at,
      publishedAt: page.published_at
    }
  } finally {
    db.close()
  }
}
