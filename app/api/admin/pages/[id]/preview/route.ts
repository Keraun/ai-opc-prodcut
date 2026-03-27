import { NextRequest, NextResponse } from 'next/server'
import { initializeModules } from '@/modules/init'
import { getModuleComponent, getModuleDefaultData } from '@/modules/registry'
import { readConfig } from '@/lib/config-manager'

initializeModules()

interface ModuleInfo {
  moduleId: string
  moduleName: string
  moduleInstanceId: string
  data: Record<string, unknown>
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { modules } = body as { modules: ModuleInfo[] }

    const pageConfig = readConfig(`page-${params.id}`)
    if (!pageConfig) {
      return NextResponse.json({
        success: false,
        message: '页面不存在',
      }, { status: 404 })
    }

    const moduleDataArray: Array<{
      moduleId: string
      moduleName: string
      moduleInstanceId: string
      data: Record<string, unknown>
      hasComponent: boolean
    }> = []

    for (const moduleInfo of modules) {
      const ModuleComponent = getModuleComponent(moduleInfo.moduleId)
      
      if (ModuleComponent) {
        const defaultData = getModuleDefaultData(moduleInfo.moduleId) || {}
        const moduleData = { ...defaultData, ...moduleInfo.data }
        
        moduleDataArray.push({
          ...moduleInfo,
          data: moduleData,
          hasComponent: true,
        })
      } else {
        moduleDataArray.push({
          ...moduleInfo,
          hasComponent: false,
        })
      }
    }

    return NextResponse.json({
      success: true,
      pageName: pageConfig.name || params.id,
      modules: moduleDataArray,
    })
  } catch (error) {
    console.error('Generate preview error:', error)
    return NextResponse.json({
      success: false,
      message: '生成预览失败',
    }, { status: 500 })
  }
}
