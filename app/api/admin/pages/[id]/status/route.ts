import { NextRequest, NextResponse } from 'next/server'
import { readConfig, writeConfig, getRuntimePath } from '@/lib/config-manager'
import fs from 'fs'
import { getSystemPages } from '@/lib/server/page-utils'

interface PageListInfo {
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
}

function getPageList(): PageListInfo[] {
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

function updatePageList(pages: PageListInfo[]) {
  const pageListPath = getRuntimePath('page-list.json')
  
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pageId = params.id
    const body = await request.json()
    const { action } = body

    if (!['publish', 'offline'].includes(action)) {
      return NextResponse.json({
        success: false,
        message: '无效的操作',
      }, { status: 400 })
    }

    const configKey = `page-${pageId}`
    const existingConfig = readConfig(configKey)
    
    if (!existingConfig || Object.keys(existingConfig).length === 0) {
      return NextResponse.json({
        success: false,
        message: '页面不存在',
      }, { status: 404 })
    }

    const now = new Date().toISOString()
    const newStatus = action === 'publish' ? 'published' : 'offline'
    
    const updatedConfig = {
      ...existingConfig,
      status: newStatus,
      updatedAt: now,
      publishedAt: action === 'publish' ? now : existingConfig.publishedAt,
    }

    writeConfig(configKey, updatedConfig)

    const pages = getPageList()
    const pageIndex = pages.findIndex(p => p.id === pageId)
    
    if (pageIndex !== -1) {
      pages[pageIndex] = {
        ...pages[pageIndex],
        status: newStatus,
        updatedAt: now,
        publishedAt: action === 'publish' ? now : pages[pageIndex].publishedAt,
      }
      updatePageList(pages)
    }

    return NextResponse.json({
      success: true,
      message: action === 'publish' ? '页面发布成功' : '页面已下线',
      status: newStatus,
    })
  } catch (error) {
    console.error('Update page status error:', error)
    return NextResponse.json({
      success: false,
      message: '更新页面状态失败',
    }, { status: 500 })
  }
}
