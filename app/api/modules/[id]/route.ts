import { NextRequest, NextResponse } from 'next/server'
import { getModuleSchema, getModuleDefaultData } from '@/modules/registry'
import { readConfig } from '@/lib/config-manager'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const moduleId = params.id
    const schema = getModuleSchema(moduleId)
    const defaultData = getModuleDefaultData(moduleId)
    const currentData = readConfig(moduleId)

    if (!schema) {
      return NextResponse.json({
        success: false,
        message: '模块不存在',
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      moduleId,
      schema,
      defaultData,
      currentData,
    })
  } catch (error) {
    console.error('Get module error:', error)
    return NextResponse.json({
      success: false,
      message: '获取模块信息失败',
    }, { status: 500 })
  }
}
