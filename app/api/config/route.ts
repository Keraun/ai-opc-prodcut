import { NextRequest, NextResponse } from "next/server"
import { getCachedConfig, getCacheTimestamp, loadAllConfigs } from "@/lib/config-cache"

export async function GET(request: NextRequest) {
  try {
    // 检查缓存是否存在，不存在则加载
    let configCache = getCachedConfig()
    if (!configCache) {
      configCache = loadAllConfigs()
    }

    // 添加缓存信息到响应头
    const response = NextResponse.json(configCache)
    response.headers.set('X-Config-Cache-Timestamp', getCacheTimestamp().toString())
    response.headers.set('X-Config-Cache-Hit', 'true')
    
    return response
  } catch (error) {
    console.error("Config API error:", error)
    return NextResponse.json({
      success: false,
      message: "获取配置失败"
    }, { status: 500 })
  }
}
