import { NextRequest } from "next/server"
import { getPageResponse, readConfig, getThemeList } from "@/lib/config-manager"
import { 
  successResponse, 
  badRequestResponse, 
  wrapApiHandler,
  parseQueryParams
} from "@/lib/api-utils"

const SAFE_CONFIG_TYPES = [
  'site',
  'site-seo',
  'theme',
]

export async function GET(request: NextRequest) {
  return wrapApiHandler(async () => {
    const params = parseQueryParams(request)
    const { page, type, is_current } = params
    
    if (page) {
      const pageResponse = getPageResponse(page)
      return successResponse(pageResponse)
    }
    
    if (!type) {
      return badRequestResponse('缺少 type 参数')
    }
    
    const isSafeType = SAFE_CONFIG_TYPES.includes(type) || 
      type.startsWith('page-') || 
      type.startsWith('data-') ||
      type.startsWith('section-')
    
    if (!isSafeType) {
      return badRequestResponse('无效的配置类型')
    }
    
    if (type === 'theme') {
      const onlyCurrent = is_current === 'true' || is_current === '1'
      const themeList = getThemeList(onlyCurrent)
      return successResponse(themeList)
    }
    
    const config = readConfig(type)
    return successResponse(config)
  })
}
