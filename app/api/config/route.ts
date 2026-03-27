import { NextRequest, NextResponse } from "next/server"
import { readAllConfigs, getPageResponse, readConfig } from "@/lib/config-manager"

const SAFE_CONFIG_TYPES = [
  'site',
  'site-seo',
  'site-navigation',
  'theme',
  'theme-modern',
  'theme-nature',
  'theme-tech',
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('page')
    
    if (pageId) {
      const pageResponse = getPageResponse(pageId)
      return NextResponse.json(pageResponse)
    }
    
    const configs = readAllConfigs()
    const safeConfigs: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(configs)) {
      if (SAFE_CONFIG_TYPES.includes(key) || 
          key.startsWith('page-') || 
          key.startsWith('data-') ||
          key.startsWith('section-')) {
        safeConfigs[key] = value
      }
    }
    
    return NextResponse.json(safeConfigs)
  } catch (error) {
    console.error("Config API error:", error)
    return NextResponse.json({
      success: false,
      message: "获取配置失败"
    }, { status: 500 })
  }
}
