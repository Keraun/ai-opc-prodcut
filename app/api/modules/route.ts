import { NextRequest, NextResponse } from 'next/server'
import { 
  getModuleInstanceData, 
  updateModuleInstanceData,
  getModuleData,
  getAllAvailableModules,
  getModuleTemplate
} from '@/lib/module-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const moduleInstanceId = searchParams.get('moduleInstanceId')
    const moduleId = searchParams.get('moduleId')
    const action = searchParams.get('action')

    if (action === 'available') {
      const modules = getAllAvailableModules()
      return NextResponse.json({
        success: true,
        data: modules
      })
    }

    if (action === 'template' && moduleId) {
      const template = getModuleTemplate(moduleId)
      
      if (!template) {
        return NextResponse.json({
          success: false,
          message: `模块模板 ${moduleId} 不存在`
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: template
      })
    }

    if (moduleInstanceId) {
      const data = getModuleInstanceData(moduleInstanceId)
      
      if (!data) {
        return NextResponse.json({
          success: false,
          message: `模块实例 ${moduleInstanceId} 不存在`
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: {
          moduleInstanceId,
          ...data
        }
      })
    }

    if (moduleId) {
      const moduleData = getModuleData(moduleId)
      
      if (!moduleData) {
        return NextResponse.json({
          success: false,
          message: `模块 ${moduleId} 不存在`
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: moduleData
      })
    }

    return NextResponse.json({
      success: false,
      message: '请提供 moduleInstanceId 或 moduleId 参数'
    }, { status: 400 })
  } catch (error) {
    console.error('Module instance API error:', error)
    return NextResponse.json({
      success: false,
      message: '获取模块数据失败'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { moduleInstanceId, data } = body

    if (!moduleInstanceId) {
      return NextResponse.json({
        success: false,
        message: 'moduleInstanceId 参数必填'
      }, { status: 400 })
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json({
        success: false,
        message: 'data 参数必须是一个对象'
      }, { status: 400 })
    }

    const success = updateModuleInstanceData(moduleInstanceId, data)

    if (success) {
      return NextResponse.json({
        success: true,
        message: '模块实例数据更新成功'
      })
    } else {
      return NextResponse.json({
        success: false,
        message: '模块实例数据更新失败'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Module instance update error:', error)
    return NextResponse.json({
      success: false,
      message: '更新模块实例数据失败'
    }, { status: 500 })
  }
}
