import { BaseRepository } from './BaseRepository'
import { safeJsonParse, safeJsonStringify } from '../json-utils'

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
      data: entity.data ? safeJsonStringify(entity.data) : null
    }
  }

  findByPageId(pageId: string): PageModule[] {
    return this.findWhere({ pageId })
  }

  findByModuleInstanceId(moduleInstanceId: string): PageModule | null {
    return this.findByField('module_instance_id', moduleInstanceId)
  }

  deleteByPageId(pageId: string): boolean {
    return this.deleteWhere({ page_id: pageId })
  }

  updateModuleData(moduleInstanceId: string, data: any): boolean {
    const module = this.findByModuleInstanceId(moduleInstanceId)
    if (module) {
      return this.update(module.id!, { data })
    }
    return false
  }
}
