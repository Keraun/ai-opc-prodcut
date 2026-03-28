import { BaseRepository } from './BaseRepository'
import { safeJsonParse, safeJsonStringify } from '../json-utils'

export interface Page {
  id?: number
  pageId: string
  name: string
  slug: string
  type: string
  description?: string | null
  status: string
  isSystem: boolean
  isDeletable: boolean
  route?: string | null
  dynamicParam?: string | null
  moduleInstanceIds: string[]
  createdAt?: string
  updatedAt?: string
  publishedAt?: string | null
}

export class PageRepository extends BaseRepository<Page> {
  constructor() {
    super('pages', 'id')
  }

  protected mapRowToEntity(row: any): Page {
    return {
      id: row.id,
      pageId: row.page_id,
      name: row.name,
      slug: row.slug,
      type: row.type,
      description: row.description,
      status: row.status,
      isSystem: row.is_system === 1,
      isDeletable: row.is_deletable === 1,
      route: row.route,
      dynamicParam: row.dynamic_param,
      moduleInstanceIds: safeJsonParse(row.module_instance_ids, []),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      publishedAt: row.published_at
    }
  }

  protected mapEntityToRow(entity: Partial<Page>): Record<string, any> {
    return {
      page_id: entity.pageId,
      name: entity.name,
      slug: entity.slug,
      type: entity.type,
      description: entity.description || null,
      status: entity.status,
      is_system: entity.isSystem ? 1 : 0,
      is_deletable: entity.isDeletable ? 1 : 0,
      route: entity.route || null,
      dynamic_param: entity.dynamicParam || null,
      module_instance_ids: entity.moduleInstanceIds ? safeJsonStringify(entity.moduleInstanceIds) : '[]',
      published_at: entity.publishedAt || null
    }
  }

  findByPageId(pageId: string): Page | null {
    return this.findByField('page_id', pageId)
  }

  getAllPages(): Page[] {
    return this.findAll()
  }

  getSystemPages(): Page[] {
    return this.findWhere({ isSystem: true })
  }

  updateModuleInstanceIds(pageId: string, moduleInstanceIds: string[]): boolean {
    const page = this.findByPageId(pageId)
    if (page) {
      return this.update(page.id!, { moduleInstanceIds })
    }
    return false
  }
}
