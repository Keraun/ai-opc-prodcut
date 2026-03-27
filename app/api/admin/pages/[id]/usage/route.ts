import { NextRequest, NextResponse } from 'next/server'
import { readConfig, getRuntimePath } from '@/lib/config-manager'
import fs from 'fs'

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pageId = params.id
    const pages = getPageList()
    const page = pages.find(p => p.id === pageId)
    
    if (!page) {
      return NextResponse.json({
        success: false,
        message: '页面不存在',
      }, { status: 404 })
    }
    
    // 检查其他页面是否引用了此页面
    const usedBy: string[] = []
    
    for (const otherPage of pages) {
      if (otherPage.id === pageId) continue
      
      // 读取其他页面的配置
      const configKey = `page-${otherPage.id}`
      const pageConfig = readConfig(configKey)
      
      if (pageConfig) {
        // 检查页面配置中是否包含对目标页面的引用
        const configString = JSON.stringify(pageConfig)
        if (configString.includes(page.slug) || configString.includes(page.id)) {
          usedBy.push(`${otherPage.name} (/${otherPage.slug})`)
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      pageId,
      pageName: page.name,
      usedBy,
      usageCount: usedBy.length
    })
  } catch (error) {
    console.error('Check page usage error:', error)
    return NextResponse.json({
      success: false,
      message: '检查页面使用情况失败',
    }, { status: 500 })
  }
}