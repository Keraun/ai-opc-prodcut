import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { readConfig, writeConfig, deleteConfig, getRuntimePath } from '@/lib/config-manager'
import type { ModuleData } from '@/modules/types'

interface PageInfo {
  id: string
  name: string
  slug: string
  modules: ModuleData[]
  createdAt?: string
  updatedAt?: string
}

function getPageDetail(pageId: string): PageInfo | null {
  const pageConfig = readConfig(`page-${pageId}`)
  
  if (!pageConfig || Object.keys(pageConfig).length === 0) {
    return null
  }

  const moduleIds = (pageConfig.modules as string[]) || []
  const modules: ModuleData[] = moduleIds.map((moduleId, index) => {
    const moduleData = readConfig(moduleId) || {}
    
    return {
      moduleName: (moduleData.moduleName as string) || moduleId,
      moduleId,
      moduleInstanceId: `${moduleId}-${index}`,
      data: moduleData,
    }
  })

  return {
    id: pageId,
    name: (pageConfig.name as string) || pageId,
    slug: (pageConfig.slug as string) || pageId,
    modules,
    createdAt: pageConfig.createdAt as string,
    updatedAt: pageConfig.updatedAt as string,
  }
}

function updatePage(pageId: string, updates: { name?: string; slug?: string; modules?: ModuleData[] }): boolean {
  try {
    const configKey = `page-${pageId}`
    const existingConfig = readConfig(configKey)
    
    if (!existingConfig || Object.keys(existingConfig).length === 0) {
      return false
    }

    const updatedConfig = {
      ...existingConfig,
      ...updates,
      modules: updates.modules?.map(m => m.moduleId) || existingConfig.modules,
      updatedAt: new Date().toISOString(),
    }

    writeConfig(configKey, updatedConfig)

    if (updates.modules) {
      updates.modules.forEach(module => {
        writeConfig(module.moduleId, module.data)
      })
    }

    return true
  } catch (error) {
    console.error('Error updating page:', error)
    return false
  }
}

function deletePage(pageId: string): boolean {
  try {
    const configKey = `page-${pageId}`
    return deleteConfig(configKey)
  } catch (error) {
    console.error('Error deleting page:', error)
    return false
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pageId = params.id
    const page = getPageDetail(pageId)

    if (!page) {
      return NextResponse.json({
        success: false,
        message: '页面不存在',
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      ...page,
    })
  } catch (error) {
    console.error('Get page error:', error)
    return NextResponse.json({
      success: false,
      message: '获取页面详情失败',
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pageId = params.id
    const body = await request.json()
    const { name, slug, modules } = body

    const success = updatePage(pageId, { name, slug, modules })

    if (success) {
      return NextResponse.json({
        success: true,
        message: '页面更新成功',
      })
    } else {
      return NextResponse.json({
        success: false,
        message: '页面更新失败',
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Update page error:', error)
    return NextResponse.json({
      success: false,
      message: '更新页面失败',
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pageId = params.id
    const systemPages = ['home', 'product', 'products', '404']
    
    if (systemPages.includes(pageId)) {
      return NextResponse.json({
        success: false,
        message: '系统页面不能删除',
      }, { status: 400 })
    }

    const success = deletePage(pageId)

    if (success) {
      return NextResponse.json({
        success: true,
        message: '页面删除成功',
      })
    } else {
      return NextResponse.json({
        success: false,
        message: '页面删除失败',
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Delete page error:', error)
    return NextResponse.json({
      success: false,
      message: '删除页面失败',
    }, { status: 500 })
  }
}
