import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { readConfig, writeConfig, getRuntimePath } from '@/lib/config-manager'

interface PageInfo {
  id: string
  name: string
  slug: string
  modules: string[]
  type?: 'static' | 'dynamic'
  dynamicParam?: string
  createdAt: string
  updatedAt: string
  isSystem?: boolean
  isDeletable?: boolean
}

function getPageList(): PageInfo[] {
  const pageListPath = getRuntimePath('page-list.json')
  
  try {
    if (fs.existsSync(pageListPath)) {
      const pageListData = JSON.parse(fs.readFileSync(pageListPath, 'utf-8'))
      return pageListData.pages || []
    }
  } catch (error) {
    console.error('Error reading page-list.json:', error)
  }
  
  return []
}

function updatePageList(pages: PageInfo[]) {
  const pageListPath = getRuntimePath('page-list.json')
  
  try {
    const pageListData = {
      pages,
      systemPages: ['home', 'product', '404'],
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
    const configKey = `page-${pageId}`
    
    const existingConfig = readConfig(configKey)
    if (existingConfig && Object.keys(existingConfig).length > 0) {
      const existingName = existingConfig.name as string || pageId
      return { success: false, error: `页面路径 "/${slug}" 已被 "${existingName}" 占用，请使用其他路径` }
    }

    const existingPages = getPageList()
    const nameConflict = existingPages.find(p => p.name.toLowerCase() === name.toLowerCase())
    if (nameConflict) {
      return { success: false, error: `页面名称 "${name}" 已存在，请使用其他名称` }
    }

    if (type === 'dynamic' && !dynamicParam) {
      return { success: false, error: '动态路由页面必须指定动态参数名称' }
    }

    const newPageConfig = {
      name,
      slug,
      type,
      dynamicParam: type === 'dynamic' ? dynamicParam : undefined,
      modules: ['site-root', 'site-header', 'site-footer'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    writeConfig(configKey, newPageConfig)
    
    const newPage: PageInfo = {
      id: pageId,
      name,
      slug,
      modules: ['site-root', 'site-header', 'site-footer'],
      type,
      dynamicParam: type === 'dynamic' ? dynamicParam : undefined,
      isSystem: false,
      isDeletable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
