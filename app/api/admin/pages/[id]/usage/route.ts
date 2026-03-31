import { NextRequest } from 'next/server'
import { readConfig, getRuntimePath } from '@/lib/config-manager'
import fs from 'fs'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-utils'

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
  const pageListPath = getRuntimePath('page_list.json')
  
  try {
    if (fs.existsSync(pageListPath)) {
      const pageListData = JSON.parse(fs.readFileSync(pageListPath, 'utf-8'))
      return pageListData.pages || []
    }
  } catch (error) {
    console.error('Error reading page_list.json:', error)
  }
  
  return []
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pageId } = await params
    const pages = getPageList()
    const page = pages.find(p => p.id === pageId)
    
    if (!page) {
      return notFoundResponse('页面不存在')
    }
    
    const usedBy: string[] = []
    
    for (const otherPage of pages) {
      if (otherPage.id === pageId) continue
      
      const configKey = `page-${otherPage.id}`
      const pageConfig = readConfig(configKey)
      
      if (pageConfig) {
        const configString = JSON.stringify(pageConfig)
        if (configString.includes(page.slug) || configString.includes(page.id)) {
          usedBy.push(`${otherPage.name} (/${otherPage.slug})`)
        }
      }
    }
    
    return successResponse({
      pageId,
      pageName: page.name,
      usedBy,
      usageCount: usedBy.length
    })
  } catch (error) {
    console.error('Check page usage error:', error)
    return errorResponse('检查页面使用情况失败')
  }
}
