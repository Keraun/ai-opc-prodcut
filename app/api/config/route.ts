import { NextRequest } from "next/server"
import { readAllConfigs, getPageResponse, readConfig } from "@/lib/config-manager"
import { 
  successResponse, 
  errorResponse, 
  wrapApiHandler 
} from "@/lib/api-utils"

const SAFE_CONFIG_TYPES = [
  'site',
  'site-seo',
  'site-navigation',
  'theme',
]

export async function GET(request: NextRequest) {
  return wrapApiHandler(async () => {
    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('page')
    
    if (pageId) {
      const pageResponse = getPageResponse(pageId)
      return successResponse(pageResponse)
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
    
    return successResponse(safeConfigs)
  })
}
