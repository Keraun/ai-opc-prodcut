import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getSystemPages } from '@/lib/server/page-utils'
import { readConfig, writeConfig, getRuntimePath, getTemplatePath } from '@/lib/config-manager'

interface PageInfo {
  id: string
  name: string
  slug: string
  modules: string[]
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
  const pageListPath = getRuntimePath('page-list')
  const pageListTemplatePath = getTemplatePath('page-list')
  
  try {
    // 首先尝试读取运行时的page-list.json
    if (fs.existsSync(pageListPath)) {
      const pageListData = JSON.parse(fs.readFileSync(pageListPath, 'utf-8'))
      return pageListData.pages || []
    }
    
    // 如果运行时文件不存在，尝试读取模板文件
    if (fs.existsSync(pageListTemplatePath)) {
      const templateData = JSON.parse(fs.readFileSync(pageListTemplatePath, 'utf-8'))
      
      // 复制模板到运行时目录
      const runtimeDir = path.dirname(pageListPath)
      if (!fs.existsSync(runtimeDir)) {
        fs.mkdirSync(runtimeDir, { recursive: true })
      }
      
      fs.writeFileSync(pageListPath, JSON.stringify(templateData, null, 2), 'utf-8')
      return templateData.pages || []
    }
  } catch (error) {
    console.error('Error reading page-list.json:', error)
  }
  
  // 如果都不存在，返回空数组
  return []
}

function updatePageList(pages: PageInfo[]) {
  const pageListPath = getRuntimePath('page-list')
  
  try {
    // 尝试读取现有的page-list.json文件，保留systemPages配置
    let existingSystemPages: string[] = ['home', '404']
    
    if (fs.existsSync(pageListPath)) {
      const existingData = JSON.parse(fs.readFileSync(pageListPath, 'utf-8'))
      if (existingData.systemPages) {
        existingSystemPages = existingData.systemPages
      }
    }
    
    const pageListData = {
      pages,
      systemPages: existingSystemPages,
      dynamicRoutePattern: '[param]',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    fs.writeFileSync(pageListPath, JSON.stringify(pageListData, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error updating page-list.json:', error)
  }
}

function createPage(
  name: string, 
  slug: string, 
  type: 'static' | 'dynamic' = 'static',
  dynamicParam?: string
): { success: boolean; pageId?: string; error?: string } {
  try {
    const pageId = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    const existingPages = getPageList()
    const pageExistsInList = existingPages.find(p => p.id === pageId)
    
    // 检查页面名称是否冲突
    const nameConflict = existingPages.find(p => p.name.toLowerCase() === name.toLowerCase())
    if (nameConflict) {
      return { success: false, error: `页面名称 "${name}" 已存在，请使用其他名称` }
    }
    
    if (pageExistsInList) {
      // 如果页面在page-list.json中存在，返回错误
      return { success: false, error: `页面路径 "/${slug}" 已被 "${pageExistsInList.name}" 占用，请使用其他路径` }
    }

    if (type === 'dynamic' && !dynamicParam) {
      return { success: false, error: '动态路由页面必须指定动态参数名称' }
    }

    const newPage: PageInfo = {
      id: pageId,
      name,
      slug,
      modules: ['site-root', 'site-header', 'site-footer'],
      type,
      dynamicParam: type === 'dynamic' ? dynamicParam : undefined,
      status: 'draft',
      isSystem: false,
      isDeletable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      route: type === 'dynamic' ? `/${slug}/[${dynamicParam}]` : `/${slug}`,
      description: `新创建的${type === 'dynamic' ? '动态' : '静态'}页面`,
    }
    
    const updatedPages = [...existingPages, newPage]
    updatePageList(updatedPages)
    
    return { success: true, pageId }
  } catch (error) {
    console.error('Error creating page:', error)
    return { success: false, error: '创建页面失败' }
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
