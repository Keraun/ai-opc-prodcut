import "server-only"
import fs from 'fs'
import path from 'path'
import type { ModuleData, ModuleRegistration } from '@/modules/types'
import { getDatabase } from './database'
import { readConfig, writeConfig } from './config-manager'

export function getPageModules(pageId: string): ModuleData[] {
  const db = getDatabase()
  
  try {
    const pageModules = db.prepare(`
      SELECT pm.*, md.data as default_data
      FROM page_modules pm
      LEFT JOIN module_data md ON pm.module_name = md.module_name
      WHERE pm.page_id = ?
      ORDER BY pm.module_order
    `).all(pageId) as any[]
    
    return pageModules.map((pm: any) => {
      const moduleData = pm.data 
        ? JSON.parse(pm.data) 
        : (pm.default_data ? JSON.parse(pm.default_data) : {})
      
      return {
        moduleName: pm.module_name,
        moduleId: pm.module_name,
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
      SELECT pm.*, md.data as default_data
      FROM page_modules pm
      LEFT JOIN module_data md ON pm.module_name = md.module_name
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
    
    const moduleName = moduleInstanceId.split('-')[0]
    const defaultModule = db.prepare(`
      SELECT data FROM module_data WHERE module_name = ?
    `).get(moduleName) as any
    
    if (defaultModule) {
      return JSON.parse(defaultModule.data)
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
      SELECT * FROM module_data WHERE module_name = ?
    `).get(moduleId) as any
    
    if (!module) {
      return null
    }
    
    const data = JSON.parse(module.data)
    
    return {
      moduleName: (data.moduleName as string) || moduleId,
      moduleId: (data.moduleId as string) || moduleId,
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
      SET data = ? 
      WHERE module_instance_id = ?
    `).run(JSON.stringify(data), moduleInstanceId)
    
    if (result.changes > 0) {
      return true
    }
    
    const moduleName = moduleInstanceId.split('-')[0]
    const defaultResult = db.prepare(`
      UPDATE module_data 
      SET data = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE module_name = ?
    `).run(JSON.stringify(data), moduleName)
    
    return defaultResult.changes > 0
  } finally {
    db.close()
  }
}

export function updatePageModules(pageId: string, modules: ModuleData[]): boolean {
  const db = getDatabase()
  
  try {
    db.exec('BEGIN TRANSACTION')
    
    db.prepare('DELETE FROM page_modules WHERE page_id = ?').run(pageId)
    
    const stmt = db.prepare(`
      INSERT INTO page_modules (page_id, module_instance_id, module_name, module_order, data)
      VALUES (?, ?, ?, ?, ?)
    `)
    
    modules.forEach((module, index) => {
      const moduleInstanceId = module.moduleInstanceId || 
        `${module.moduleId}-${Date.now()}-${index}`
      
      stmt.run(
        pageId,
        moduleInstanceId,
        module.moduleId,
        index,
        module.data ? JSON.stringify(module.data) : null
      )
    })
    
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
      SELECT * FROM module_data WHERE module_name = ?
    `).get(moduleId) as any
    
    if (module) {
      const data = JSON.parse(module.data)
      return {
        moduleName: (data.moduleName as string) || moduleId,
        moduleId: (data.moduleId as string) || moduleId,
        component: null as any,
        schema: (data.schema as Record<string, unknown>) || {},
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
      SELECT module_name FROM module_data
    `).all() as any[]
    
    return modules.map((m: any) => m.module_name)
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
    const moduleInstanceId = `${moduleId}-${Date.now()}-${order}`
    
    db.prepare(`
      INSERT INTO page_modules (page_id, module_instance_id, module_name, module_order, data)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      pageId,
      moduleInstanceId,
      moduleId,
      order,
      data ? JSON.stringify(data) : null
    )
    
    return moduleInstanceId
  } finally {
    db.close()
  }
}

export function deleteModuleInstance(moduleInstanceId: string): boolean {
  const db = getDatabase()
  
  try {
    const result = db.prepare(`
      DELETE FROM page_modules WHERE module_instance_id = ?
    `).run(moduleInstanceId)
    
    return result.changes > 0
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
      SET module_order = ? 
      WHERE page_id = ? AND module_instance_id = ?
    `)
    
    moduleInstanceIds.forEach((instanceId, index) => {
      stmt.run(index, pageId, instanceId)
    })
    
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
