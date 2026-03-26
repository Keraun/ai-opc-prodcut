import { NextRequest, NextResponse } from 'next/server'
import { initializeModules } from '@/modules/init'
import { getModuleSchema } from '@/modules/registry'

initializeModules()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const moduleId = params.id
    const schema = getModuleSchema(moduleId)

    if (!schema) {
      return NextResponse.json({
        success: false,
        message: '模块schema不存在',
      }, { status: 404 })
    }

    return NextResponse.json(schema)
  } catch (error) {
    console.error('Get module schema error:', error)
    return NextResponse.json({
      success: false,
      message: '获取模块schema失败',
    }, { status: 500 })
  }
}
