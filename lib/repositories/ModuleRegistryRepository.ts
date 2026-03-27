import { BaseRepository } from './BaseRepository'
import { safeJsonParse, safeJsonStringify } from '../json-utils'

export interface ModuleRegistry {
  id?: number
  moduleId: string
  moduleName: string
  schema?: any | null
  defaultData?: any | null
  createdAt?: string
  updatedAt?: string
}

export class ModuleRegistryRepository extends BaseRepository<ModuleRegistry> {
  constructor() {
    super('module_registry', 'id')
  }

  protected mapRowToEntity(row: any): ModuleRegistry {
    return {
      id: row.id,
      moduleId: row.module_id,
      moduleName: row.module_name,
      schema: safeJsonParse(row.schema, null),
      defaultData: safeJsonParse(row.default_data, null),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  protected mapEntityToRow(entity: Partial<ModuleRegistry>): Record<string, any> {
    return {
      module_id: entity.moduleId,
      module_name: entity.moduleName,
      schema: entity.schema ? safeJsonStringify(entity.schema) : null,
      default_data: entity.defaultData ? safeJsonStringify(entity.defaultData) : null
    }
  }

  findByModuleId(moduleId: string): ModuleRegistry | null {
    return this.findByField('module_id', moduleId)
  }

  getAllModules(): ModuleRegistry[] {
    return this.findAll()
  }

  registerModule(moduleId: string, moduleName: string, schema: any, defaultData: any): void {
    const existing = this.findByModuleId(moduleId)
    if (existing) {
      this.update(existing.id!, { moduleId, moduleName, schema, defaultData })
    } else {
      this.create({ moduleId, moduleName, schema, defaultData })
    }
  }

  getAllDefaultData(): Record<string, any> {
    const modules = this.findAll()
    const result: Record<string, any> = {}
    for (const module of modules) {
      if (module.defaultData) {
        result[module.moduleId] = module.defaultData
      }
    }
    return result
  }
}
