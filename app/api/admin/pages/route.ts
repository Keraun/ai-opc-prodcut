import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

interface PageInfo {
  id: string
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
  const db = getDatabase()
  
  try {
    const pages = db.prepare('SELECT * FROM pages').all() as any[]
    
    return pages.map(page => {
      let moduleInstanceIds: string[] = []
      try {
        moduleInstanceIds = page.module_instance_ids ? JSON.parse(page.module_instance_ids) : []
      } catch (e) {
        moduleInstanceIds = []
      }
      
      return {
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
        moduleInstanceIds
      }
    })
  } finally {
    db.close()
  }
}

function createPage(
  name: string, 
  slug: string, 
  type: 'static' | 'dynamic' = 'static',
  dynamicParam?: string
): { success: boolean; pageId?: string; error?: string } {
  const db = getDatabase()
  
  try {
    const pageId = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    
    const existingPage = db.prepare('SELECT page_id, name FROM pages WHERE page_id = ? OR slug = ?').get(pageId, slug) as any
    
    if (existingPage) {
      return { success: false, error: `页面路径 "/${slug}" 已被 "${existingPage.name}" 占用，请使用其他路径` }
    }
    
    const nameConflict = db.prepare('SELECT name FROM pages WHERE name = ?').get(name) as any
    if (nameConflict) {
      return { success: false, error: `页面名称 "${name}" 已存在，请使用其他名称` }
    }

    if (type === 'dynamic' && !dynamicParam) {
      return { success: false, error: '动态路由页面必须指定动态参数名称' }
    }

    const now = new Date().toISOString()
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
      JSON.stringify([]),
      now,
      now
    )
    
    return { success: true, pageId }
  } catch (error) {
    console.error('Error creating page:', error)
    return { success: false, error: '创建页面失败' }
  } finally {
    db.close()
  }
}

export async function GET() {
  try {
    const pages = getPageList()
    
    return NextResponse.json({
      success: true,
      pages,
    })
  } catch (error) {
    console.error('Get pages error:', error)
    return NextResponse.json({
      success: false,
      message: '获取页面列表失败',
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, type = 'static', dynamicParam } = body

    if (!name || !slug) {
      return NextResponse.json({
        success: false,
        message: '页面名称和路径不能为空',
      }, { status: 400 })
    }

    if (type === 'dynamic' && !dynamicParam) {
      return NextResponse.json({
        success: false,
        message: '动态路由页面必须指定动态参数名称',
      }, { status: 400 })
    }

    const result = createPage(name, slug, type, dynamicParam)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        pageId: result.pageId,
        message: '页面创建成功',
      })
    } else {
      return NextResponse.json({
        success: false,
        message: result.error || '创建页面失败',
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Create page error:', error)
    return NextResponse.json({
      success: false,
      message: '创建页面失败',
    }, { status: 500 })
  }
}
