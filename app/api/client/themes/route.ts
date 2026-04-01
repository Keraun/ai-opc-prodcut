import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { readConfig } from '@/lib/config-manager'

export async function GET(request: NextRequest) {
  try {
    const themeConfig = readConfig('theme')
    return successResponse(themeConfig)
  } catch (error) {
    console.error('Error reading theme config:', error)
    return errorResponse('获取主题配置失败')
  }
}
