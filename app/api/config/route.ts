import { NextRequest, NextResponse } from "next/server"
import { readAllConfigs, getPageResponse } from "@/lib/config-manager"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('page')
    
    if (pageId) {
      const pageResponse = getPageResponse(pageId)
      return NextResponse.json(pageResponse)
    }
    
    const configs = readAllConfigs()
    return NextResponse.json(configs)
  } catch (error) {
    console.error("Config API error:", error)
    return NextResponse.json({
      success: false,
      message: "获取配置失败"
    }, { status: 500 })
  }
}
