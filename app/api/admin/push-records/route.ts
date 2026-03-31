import { jsonDb } from '@/lib/json-database'
import { NextRequest, NextResponse } from 'next/server'

// 推送记录最多保留100条
const MAX_RECORDS = 100

function limitPushRecords() {
  const records = jsonDb.getAll('push_records')
  if (records.length > MAX_RECORDS) {
    // 按时间倒序排序，保留最新的100条
    const sortedRecords = records.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    const limitedRecords = sortedRecords.slice(0, MAX_RECORDS)
    jsonDb.importData('push_records', limitedRecords)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const channel = searchParams.get('channel') || ''
    const status = searchParams.get('status') || ''

    let records = jsonDb.getAll('push_records')

    // 过滤
    if (channel) {
      records = records.filter((record: any) => record.channel === channel)
    }
    if (status) {
      records = records.filter((record: any) => record.status === status)
    }

    // 按时间倒序排序
    records.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    // 分页
    const total = records.length
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedRecords = records.slice(start, end)

    return NextResponse.json({
      success: true,
      data: {
        list: paginatedRecords,
        page,
        pageSize,
        total
      }
    })
  } catch (error) {
    console.error('获取推送记录失败:', error)
    return NextResponse.json(
      { success: false, message: '获取推送记录失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const newRecord = jsonDb.insert('push_records', {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    // 限制记录数量
    limitPushRecords()

    return NextResponse.json({
      success: true,
      data: newRecord
    })
  } catch (error) {
    console.error('创建推送记录失败:', error)
    return NextResponse.json(
      { success: false, message: '创建推送记录失败' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data

    const updatedRecord = jsonDb.update('push_records', id, {
      ...updateData,
      updated_at: new Date().toISOString()
    })

    if (!updatedRecord) {
      return NextResponse.json(
        { success: false, message: '推送记录不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedRecord
    })
  } catch (error) {
    console.error('更新推送记录失败:', error)
    return NextResponse.json(
      { success: false, message: '更新推送记录失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const data = await request.json()
    const { id } = data

    const success = jsonDb.delete('push_records', id)

    if (!success) {
      return NextResponse.json(
        { success: false, message: '推送记录不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除推送记录失败:', error)
    return NextResponse.json(
      { success: false, message: '删除推送记录失败' },
      { status: 500 }
    )
  }
}
