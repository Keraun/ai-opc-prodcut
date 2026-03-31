import { jsonDb } from '@/lib/json-database'
import { NextRequest, NextResponse } from 'next/server'

// 模拟推送服务
async function simulatePush(record: any) {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 模拟推送结果，80%成功率
  const success = Math.random() > 0.2
  
  if (success) {
    return {
      success: true,
      response: '推送成功'
    }
  } else {
    return {
      success: false,
      error: '推送失败：模拟错误'
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { id } = data

    // 查找推送记录
    const records = jsonDb.getAll('push_records')
    const record = records.find((r: any) => r.id === id)

    if (!record) {
      return NextResponse.json(
        { success: false, message: '推送记录不存在' },
        { status: 404 }
      )
    }

    // 模拟推送
    const pushResult = await simulatePush(record)

    // 更新推送记录状态
    const updatedRecord = jsonDb.update('push_records', id, {
      status: pushResult.success ? 'success' : 'failed',
      response: pushResult.success ? pushResult.response : record.response,
      error: pushResult.success ? '' : pushResult.error,
      updated_at: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      data: updatedRecord
    })
  } catch (error) {
    console.error('重试推送失败:', error)
    return NextResponse.json(
      { success: false, message: '重试推送失败' },
      { status: 500 }
    )
  }
}
