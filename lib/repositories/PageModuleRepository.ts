import { BaseRepository } from './BaseRepository'
import { safeJsonParse } from '../json-utils'

export interface PageModule {
  id?: number
  moduleInstanceId: string
  pageId: string
  moduleId: string
  moduleName: string
  moduleOrder: number
  data?: any | null
  createdAt?: string
  updatedAt?: string
}

export class PageModuleRepository extends BaseRepository<PageModule> {
  constructor() {
    super('page_modules', 'id')
  }

  protected mapRowToEntity(row: any): PageModule {
    return {
      id: row.id,
      moduleInstanceId: row.module_instance_id,
      pageId: row.page_id,
      moduleId: row.module_id,
      moduleName: row.module_name,
      moduleOrder: row.module_order,
      data: safeJsonParse(row.data, null),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  protected mapEntityToRow(entity: Partial<PageModule>): Record<string, any> {
    return {
      module_instance_id: entity.moduleInstanceId,
      page_id: entity.pageId,
      module_id: entity.moduleId,
      module_name: entity.moduleName,
      module_order: entity.moduleOrder,
      data: entity.data ? JSON.stringify(entity.data) : null
    }
  }

  findByModuleInstanceId(moduleInstanceId: string): PageModule | null {
    return this.findByField('module_instance_id', moduleInstanceId)
  }

  findByPageId(pageId: string): PageModule[] {
    return this.withDatabase(db => {
      const rows = db.prepare(`
        SELECT * FROM page_modules 
        WHERE page_id = ? 
        ORDER BY module_order
      `).all(pageId)
      return rows.map((row: any) => this.mapRowToEntity(row))
    })
  }

  deleteByPageId(pageId: string): void {
    this.withDatabase(db => {
      db.prepare('DELETE FROM page_modules WHERE page_id = ?').run(pageId)
    })
  }

  deleteByModuleInstanceId(moduleInstanceId: string): boolean {
    const module = this.findByModuleInstanceId(moduleInstanceId)
    return module ? this.delete(module.id!) : false
  }
}
