import { NextRequest } from "next/server"
import { syncSiteRootToAllPages } from "@/lib/config-manager"
import { wrapAuthApiHandler, successResponse, errorResponse } from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  return wrapAuthApiHandler(async () => {
    try {
      const body = await request.json()
      const { data } = body

      if (!data) {
        return errorResponse('缺少配置数据')
      }

      const result = syncSiteRootToAllPages(data)

      if (result.success) {
        return successResponse({
          syncedPages: result.syncedPages,
          message: result.message
        })
      } else {
        return errorResponse(result.message || '同步失败')
      }
    } catch (error) {
      console.error('Error syncing site config:', error)
      return errorResponse('同步站点配置失败')
    }
  })
}
