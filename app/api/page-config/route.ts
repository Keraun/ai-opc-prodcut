import { NextRequest, NextResponse } from 'next/server'
import { getPageConfig, getPageModules, updatePageModules } from '@/lib/module-service'
import type { ModuleData } from '@/modules/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('pageId')

    if (!pageId) {
      return NextResponse.json({
        success: false,
        message: 'pageId 参数必填'
      }, { status: 400 })
    }

    const pageConfig = getPageConfig(pageId)
    
    if (!pageConfig) {
      return NextResponse.json({
        success: false,
        message: `页面 ${pageId} 不存在`
      }, { status: 404 })
    }

    const modules = getPageModules(pageId)

    return NextResponse.json({
      success: true,
      data: {
        pageId,
        layout: pageConfig.layout || 'default',
        modules,
        moduleInstanceIds: pageConfig.moduleInstanceIds,
        config: pageConfig
      }
    })
  } catch (error) {
    console.error('Page config API error:', error)
    return NextResponse.json({
      success: false,
      message: '获取页面配置失败'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pageId, modules } = body

    if (!pageId) {
      return NextResponse.json({
        success: false,
        message: 'pageId 参数必填'
      }, { status: 400 })
    }

    if (!modules || !Array.isArray(modules)) {
      return NextResponse.json({
        success: false,
        message: 'modules 参数必须是一个数组'
      }, { status: 400 })
    }

    const success = updatePageModules(pageId, modules as ModuleData[])

    if (success) {
      return NextResponse.json({
        success: true,
        message: '页面模块更新成功'
      })
    } else {
      return NextResponse.json({
        success: false,
        message: '页面模块更新失败'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Page config update error:', error)
    return NextResponse.json({
      success: false,
      message: '更新页面配置失败'
    }, { status: 500 })
  }
}
