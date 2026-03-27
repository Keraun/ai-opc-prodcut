import { NextRequest, NextResponse } from 'next/server'
import { exportToJson, migrateFromJson } from '@/lib/migrate'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'export') {
      exportToJson()
      return NextResponse.json({
        success: true,
        message: '数据库导出成功，备份文件保存在 database/backup 目录'
      })
    }
    
    if (action === 'migrate') {
      const useTemplates = body.useTemplates || false
      migrateFromJson(useTemplates)
      return NextResponse.json({
        success: true,
        message: useTemplates ? '从模板迁移数据成功' : '从运行时数据迁移成功'
      })
    }

    return NextResponse.json(
      { success: false, message: '无效的操作' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Database operation failed:', error)
    return NextResponse.json(
      { success: false, message: '数据库操作失败', error: String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'export') {
      exportToJson()
      return NextResponse.json({
        success: true,
        message: '数据库导出成功，备份文件保存在 database/backup 目录'
      })
    }

    return NextResponse.json(
      { success: false, message: '无效的操作' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Database export failed:', error)
    return NextResponse.json(
      { success: false, message: '数据库导出失败', error: String(error) },
      { status: 500 }
    )
  }
}
