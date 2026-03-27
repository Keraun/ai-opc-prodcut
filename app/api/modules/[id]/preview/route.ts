import { NextRequest, NextResponse } from 'next/server'
import { initializeModules } from '@/modules/init'
import { getModuleComponent, getModuleDefaultData } from '@/modules/registry'

initializeModules()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const moduleId = params.id
    
    const ModuleComponent = getModuleComponent(moduleId)
    
    if (!ModuleComponent) {
      return NextResponse.json({
        success: false,
        message: '模块不存在',
      }, { status: 404 })
    }

    const defaultData = getModuleDefaultData(moduleId) || {}
    
    return NextResponse.json({
      success: true,
      moduleId,
      moduleName: moduleId,
      defaultData,
    })
  } catch (error) {
    console.error('Module preview error:', error)
    return NextResponse.json({
      success: false,
      message: '获取模块信息失败',
    }, { status: 500 })
  }
}
