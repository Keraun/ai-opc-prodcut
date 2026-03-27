import { BaseRepository } from './BaseRepository'
import { safeJsonParse, safeJsonStringify, safeJsonParseArray } from '../json-utils'
import { formatDateTime } from '../api-utils'

export interface Page {
  id?: number
  pageId: string
  name: string
  slug: string
  type?: 'static' | 'dynamic'
  description?: string | null
  status?: 'draft' | 'published' | 'offline'
  isSystem?: boolean
  isDeletable?: boolean
  route?: string | null
  dynamicParam?: string | null
  moduleInstanceIds?: string[]
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
      moduleInstanceIds: safeJsonParseArray(row.module_instance_ids, []),
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
      description: entity.description ?? null,
      status: entity.status,
      is_system: entity.isSystem ? 1 : 0,
      is_deletable: entity.isDeletable ? 1 : 0,
      route: entity.route ?? null,
      dynamic_param: entity.dynamicParam ?? null,
      module_instance_ids: entity.moduleInstanceIds 
        ? safeJsonStringify(entity.moduleInstanceIds) 
        : '[]'
    }
  }

  findByPageId(pageId: string): Page | null {
    return this.findByField('page_id', pageId)
  }

  findBySlug(slug: string): Page | null {
    return this.findByField('slug', slug)
  }

  findAllSystemPages(): string[] {
    return this.withDatabase(db => {
      const rows = db.prepare('SELECT page_id FROM pages WHERE is_system = 1').all()
      return rows.map((row: any) => row.page_id)
    })
  }

  createPage(
    name: string, 
    slug: string, 
    type: 'static' | 'dynamic' = 'static',
    dynamicParam?: string
  ): { success: boolean; pageId?: string; error?: string } {
    return this.withDatabase(db => {
      const pageId = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')
      
      const existingPage = db.prepare('SELECT page_id, name FROM pages WHERE page_id = ? OR slug = ?').get(pageId, slug)
      if (existingPage) {
        return { success: false, error: `页面路径 "/${slug}" 已被 "${existingPage.name}" 占用，请使用其他路径` }
      }
      
      const nameConflict = db.prepare('SELECT name FROM pages WHERE name = ?').get(name)
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
        '[]',
        now,
        now
      )
      
      return { success: true, pageId }
    })
  }

  deleteByPageId(pageId: string): boolean {
    const page = this.findByPageId(pageId)
    return page ? this.delete(page.id!) : false
  }
}
