import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { readConfig, writeConfig, getRuntimePath } from '@/lib/config-manager'

interface PageInfo {
  id: string
  name: string
  slug: string
  modules: string[]
  createdAt: string
  updatedAt: string
}

function getPageList(): PageInfo[] {
  const pageModuleDir = getRuntimePath('page-module')
  const pages: PageInfo[] = []

  try {
    if (fs.existsSync(pageModuleDir)) {
      const files = fs.readdirSync(pageModuleDir)
      
      files.forEach(file => {
        if (file.endsWith('.json') && file.startsWith('page-')) {
          const pageId = file.replace('.json', '').replace('page-', '')
          const pageConfig = readConfig(`page-${pageId}`)
          
          if (pageConfig) {
            const stats = fs.statSync(path.join(pageModuleDir, file))
            
            pages.push({
              id: pageId,
              name: (pageConfig.name as string) || pageId,
              slug: (pageConfig.slug as string) || pageId,
              modules: (pageConfig.modules as string[]) || [],
              createdAt: stats.birthtime.toISOString(),
              updatedAt: stats.mtime.toISOString(),
            })
          }
        }
      })
    }
  } catch (error) {
    console.error('Error reading page list:', error)
  }

  return pages
}

function createPage(name: string, slug: string): { success: boolean; pageId?: string; error?: string } {
  try {
    const pageId = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    const configKey = `page-${pageId}`
    
    const existingConfig = readConfig(configKey)
    if (existingConfig && Object.keys(existingConfig).length > 0) {
      return { success: false, error: '页面路径已存在' }
    }

    const newPageConfig = {
      name,
      slug,
      modules: ['site-root', 'site-header'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    writeConfig(configKey, newPageConfig)
    
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
    const { name, slug } = body

    if (!name || !slug) {
      return NextResponse.json({
        success: false,
        message: '页面名称和路径不能为空',
      }, { status: 400 })
    }

    const result = createPage(name, slug)
    
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
